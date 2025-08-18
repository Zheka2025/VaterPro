"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2, ArrowLeft, Barcode } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { createBlankProduct, initialCategories } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  sku: z.string().min(1, "SKU/Штрихкод обов'язковий"),
  category: z.string(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
});

const formSchema = z.object({
  products: z.array(productSchema),
});

type BulkAddFormValues = z.infer<typeof formSchema>;

function BulkAddPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [barcode, setBarcode] = useState("");
  // In a real app, categories would be fetched from the DB
  const categories = initialCategories;

  const form = useForm<BulkAddFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [],
    },
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    // TODO: Here you would fetch product data by barcode from your Interbase DB
    // For now, we'll just add a new row with the barcode as SKU
    
    append({
      name: "",
      sku: barcode,
      category: categories[0]?.name || "",
      price: 0,
      stock: 1,
    });

    setBarcode("");
  };

  const onSubmit = (data: BulkAddFormValues) => {
    // Here you would save the products to your database
    console.log(data.products);
    toast({
      title: "Товари збережено",
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
          <CardDescription>Введіть або відскануйте штрих-код, щоб додати товар до списку нижче. Інформація про товар підтягнеться з довідника (в майбутньому).</CardDescription>
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
                />
              </div>
            </div>
            <Button type="submit">Додати</Button>
          </form>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Список товарів</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Назва</TableHead>
                    <TableHead>SKU/Штрихкод</TableHead>
                    <TableHead>Категорія</TableHead>
                    <TableHead>Ціна</TableHead>
                    <TableHead>Залишок</TableHead>
                    <TableHead className="w-[50px]">Дії</TableHead>
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
                        <TableCell>
                          <Input {...form.register(`products.${index}.name`)} />
                          {errors.products?.[index]?.name && <p className="text-destructive text-xs mt-1">{errors.products[index].name.message}</p>}
                        </TableCell>
                        <TableCell>
                          <Input {...form.register(`products.${index}.sku`)} />
                          {errors.products?.[index]?.sku && <p className="text-destructive text-xs mt-1">{errors.products[index].sku.message}</p>}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" {...form.register(`products.${index}.price`)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" {...form.register(`products.${index}.stock`)} />
                        </TableCell>
                        <TableCell>
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
            <Button type="submit">Зберегти {fields.length} товар(и)</Button>
          </div>
        )}
      </form>
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
