"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { createBlankProduct } from "@/lib/constants";
import { ScrollArea } from "../ui/scroll-area";

const productSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  sku: z.string().min(1, "SKU обов'язковий"),
  category: z.string(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
});

const formSchema = z.object({
  products: z.array(productSchema),
});

type BulkAddFormValues = z.infer<typeof formSchema>;

type Props = {
  onClose: () => void;
  onSave: (products: Product[]) => void;
  categories: Category[];
};

export function BulkAddModal({ onClose, onSave, categories }: Props) {
  const form = useForm<BulkAddFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [{ name: "", sku: "", category: categories[0]?.name || "", price: 0, stock: 0 }],
    },
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const onSubmit = (data: BulkAddFormValues) => {
    const newProducts: Product[] = data.products.map((p) => {
        const blank = createBlankProduct(categories);
        return {
            ...blank,
            ...p,
        };
    });
    onSave(newProducts);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Масове додавання товарів</DialogTitle>
          <DialogDescription>
            Додайте один або декілька товарів одночасно. ID та інші поля будуть згенеровані автоматично.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 pr-6">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-lg relative">
                  <div className="col-span-3">
                    <Label>Назва</Label>
                    <Input {...form.register(`products.${index}.name`)} />
                    {errors.products?.[index]?.name && <p className="text-destructive text-xs mt-1">{errors.products[index].name.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <Label>SKU</Label>
                    <Input {...form.register(`products.${index}.sku`)} />
                     {errors.products?.[index]?.sku && <p className="text-destructive text-xs mt-1">{errors.products[index].sku.message}</p>}
                  </div>
                  <div className="col-span-3">
                    <Label>Категорія</Label>
                    <Select defaultValue={field.category} onValueChange={(value) => form.setValue(`products.${index}.category`, value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Ціна</Label>
                    <Input type="number" {...form.register(`products.${index}.price`)} />
                  </div>
                  <div className="col-span-1">
                    <Label>Залишок</Label>
                    <Input type="number" {...form.register(`products.${index}.stock`)} />
                  </div>
                  <div className="col-span-1">
                     <Label className="opacity-0">Видалити</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "", sku: "", category: categories[0]?.name || "", price: 0, stock: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Додати ще рядок
            </Button>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit">Зберегти {fields.length} товар(и)</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
