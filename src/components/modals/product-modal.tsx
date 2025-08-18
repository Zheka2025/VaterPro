"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAiGeneratedDescription, getFirebirdSuggestions } from "@/app/actions";
import { STATUSES, currency } from "@/lib/constants";
import type { Product, Category, DBSettings } from "@/lib/types";
import { Loader2, Plus, Trash2, Wand2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Назва не може бути порожньою"),
  sku: z.string().min(1, "SKU не може бути порожнім"),
  category: z.string(),
  price: z.coerce.number().min(0),
  oldPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["Чернетка", "Активний", "Прихований", "Вичерпано"]),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  attributes: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

type Props = {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
  categories: Category[];
  settings: DBSettings;
};

export function ProductModal({ product, onClose, onSave, categories, settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...product,
      attributes: Object.entries(product.attributes || {}).map(([key, value]) => ({ key, value: String(value) })),
    },
  });

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSuggest = async (query: string) => {
    form.setValue('name', query);
    if (!query || query.length < 2) {
        setSuggestions([]);
        return;
    }
    const s = await getFirebirdSuggestions(query);
    setSuggestions(s);
  };
  
  const handleGenDescription = () => {
    startTransition(async () => {
      const name = form.getValues("name");
      const category = form.getValues("category");
      if (!name) {
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Будь ласка, введіть назву товару для генерації опису.",
        });
        return;
      }
      const description = await getAiGeneratedDescription({ name, category });
      form.setValue("description", description);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Mock upload: use object URL
    const url = URL.createObjectURL(file);
    appendImage({ value: url });
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const onSubmit = (data: ProductFormValues) => {
    const finalProduct: Product = {
      ...product,
      ...data,
      attributes: (data.attributes || []).reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>),
      images: (data.images || []).map(img => typeof img === 'object' ? (img as {value: string}).value : img),
    };
    onSave(finalProduct);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{product.id ? "Редагувати товар" : "Створити товар"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-h-[80vh] overflow-y-auto pr-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Назва</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Напр. Шуруповерт 18V" {...field} onChange={(e) => handleSuggest(e.target.value)} />
                        {suggestions.length > 0 && (
                          <div className="absolute z-10 bg-card border rounded-lg w-full mt-1 max-h-48 overflow-auto shadow-lg">
                            {suggestions.map((s) => (
                              <button key={s} type="button" className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { form.setValue("name", s); setSuggestions([]); }}>{s}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem> <FormLabel>SKU</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Категорія</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Ціна</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="oldPrice" render={({ field }) => ( <FormItem> <FormLabel>Стара ціна</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Залишок</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Статус</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
              
              <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Опис</FormLabel>
                    <Button type="button" size="sm" variant="outline" onClick={handleGenDescription} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                        AI опис
                    </Button>
                  </div>
                  <FormControl><Textarea {...form.register("description")} rows={5} /></FormControl>
                  <FormMessage />
              </FormItem>
            </div>
            <div className="space-y-4">
              <FormItem>
                  <FormLabel>Атрибути</FormLabel>
                  <div className="space-y-2">
                      {attributeFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                           <Input {...form.register(`attributes.${index}.key`)} placeholder="Ключ"/>
                           <Input {...form.register(`attributes.${index}.value`)} placeholder="Значення"/>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(index)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendAttribute({key: '', value: ''})}>
                      <Plus className="mr-2 h-4 w-4"/> Додати атрибут
                  </Button>
              </FormItem>

              <FormItem>
                <div className="flex justify-between items-center">
                    <FormLabel>Зображення</FormLabel>
                    <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Завантажити
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {imageFields.map((field, index) => (
                      <div key={field.id} className="relative group aspect-square">
                          <Image src={field.value} alt="" fill className="rounded-md object-cover border"/>
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 rounded-full bg-card/70 text-card-foreground hover:bg-card hidden group-hover:flex">
                              <X className="h-3 w-3" />
                          </button>
                      </div>
                    ))}
                </div>
              </FormItem>
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={onClose}>Скасувати</Button>
              <Button type="submit">Зберегти</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
