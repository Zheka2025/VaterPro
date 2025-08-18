"use client";

import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthGuard from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowLeft, Barcode, Loader2, Search } from "lucide-react";
import type { Category } from "@/lib/types";
import { initialCategories } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { getProductByBarcode, getFirebirdSuggestions } from "@/app/actions";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";


const productSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  sku: z.string().min(1, "SKU/Штрихкод обов'язковий"),
  category: z.string().min(1, "Категорія обов'язкова"),
  price: z.coerce.number().min(0, "Ціна не може бути від'ємною"),
  stock: z.coerce.number().int().min(0, "Залишок не може бути від'ємним"),
});

const formSchema = z.object({
  products: z.array(productSchema),
});

type BulkAddFormValues = z.infer<typeof formSchema>;

function ProductNameSuggest({ control, index, onSelect }: { control: any, index: number, onSelect: (productData: any) => void }) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [query, setQuery] = useState('');

    const handleSuggest = async (searchQuery: string) => {
        setQuery(searchQuery);
        if (!searchQuery || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        const s = await getFirebirdSuggestions(searchQuery);
        setSuggestions(s);
    };

    const handleSelect = (name: string) => {
        onSelect({ name });
        setSuggestions([]);
        setQuery(name);
    }

    return (
        <Controller
            name={`products.${index}.name`}
            control={control}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <div className="relative">
                            <Input 
                                {...field} 
                                placeholder="Назва товару" 
                                onChange={(e) => {
                                    field.onChange(e);
                                    handleSuggest(e.target.value);
                                }} 
                            />
                             {suggestions.length > 0 && (
                                <div className="absolute z-20 bg-card border rounded-lg w-full mt-1 max-h-48 overflow-auto shadow-lg">
                                    {suggestions.map((s) => (
                                    <button key={s} type="button" className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => handleSelect(s)}>{s}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}


function BulkAddPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [barcode, setBarcode] = useState("");
  const categories = initialCategories;

  const form = useForm<BulkAddFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [],
    },
  });

  const { control, handleSubmit, formState: { errors }, setValue, trigger } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "products",
  });

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isSubmitting) return;

    startTransition(async () => {
        const productData = await getProductByBarcode(barcode);
        
        append({
            name: productData?.name || "",
            sku: barcode,
            category: productData?.category || categories[0]?.name || "",
            price: productData?.price || 0,
            stock: productData?.stock || 1,
        });

        // Ensure new row is validated
        await trigger(`products.${fields.length}`);
        setBarcode("");
    });
  };

  const onSubmit = (data: BulkAddFormValues) => {
    console.log(data.products);
    toast({
      title: "Товари збережено (симуляція)",
      description: `Успішно збережено ${data.products.length} товар(ів).`,
    });
    router.push('/');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Масове додавання товарів</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Сканування штрих-коду</CardTitle>
          <CardDescription>Введіть або відскануйте штрих-код та натисніть Enter. Товар автоматично додасться до списку нижче. Спробуйте код `111222333`.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBarcodeSubmit} className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="barcode">Штрих-код</Label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="barcode"
                  placeholder="837293847293"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
                 {isSubmitting && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>Додати</Button>
          </form>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Список товарів для додавання</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Назва</TableHead>
                      <TableHead className="w-[20%]">SKU/Штрихкод</TableHead>
                      <TableHead>Категорія</TableHead>
                      <TableHead>Ціна</TableHead>
                      <TableHead>Залишок</TableHead>
                      <TableHead className="w-[50px] text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          Список порожній. Відскануйте штрих-код, щоб додати товар.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fields.map((field, index) => (
                        <TableRow key={field.id} className="align-top">
                          <TableCell className="min-w-[200px]">
                            <ProductNameSuggest 
                                control={control} 
                                index={index}
                                onSelect={(productData) => {
                                    setValue(`products.${index}.name`, productData.name, { shouldValidate: true });
                                }}
                            />
                          </TableCell>
                          <TableCell className="min-w-[150px]">
                            <FormField
                                control={control}
                                name={`products.${index}.sku`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Штрих-код" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                          </TableCell>
                          <TableCell className="min-w-[150px]">
                            <FormField
                                control={control}
                                name={`products.${index}.category`}
                                render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.name}>
                                            {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                          </TableCell>
                          <TableCell className="min-w-[100px]">
                            <FormField
                                control={control}
                                name={`products.${index}.price`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} placeholder="0.00" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                          </TableCell>
                          <TableCell className="min-w-[100px]">
                            <FormField
                                control={control}
                                name={`products.${index}.stock`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="0"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {fields.length > 0 && (
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push('/')}>
                Скасувати
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Зберегти {fields.length} товар(и)
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

export default function BulkAdd() {
  return (
    <AuthGuard>
      <BulkAddPage />
    </AuthGuard>
  );
}
