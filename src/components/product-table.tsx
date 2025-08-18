"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FilePenLine, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { currency } from "@/lib/constants";
import type { Product } from "@/lib/types";

type ProductTableProps = {
  products: Product[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductTable({ products, selectedIds, onSelect, onSelectAll, onView, onEdit, onDelete }: ProductTableProps) {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <main className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary z-10">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} aria-label="Вибрати все" />
            </TableHead>
            <TableHead>Товар</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Категорія</TableHead>
            <TableHead>Ціна</TableHead>
            <TableHead>Залишок</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right w-[80px]">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Товари не знайдено.
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow key={p.id} data-state={selectedIds.includes(p.id) ? "selected" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(p.id)}
                    onCheckedChange={() => onSelect(p.id)}
                    aria-label={`Select product ${p.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={p.images?.[0] || 'https://placehold.co/600x400.png'}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover border bg-card"
                      data-ai-hint={p.category === 'Електроінструмент' ? 'power drill' : p.category === 'Фарби та лаки' ? 'paint can' : p.category === 'Сантехніка' ? 'faucet sink' : 'power outlet'}
                    />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {p.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{currency(p.price)}</span>
                    {p.oldPrice > 0 && (
                      <span className="text-xs line-through text-muted-foreground">{currency(p.oldPrice)}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <StatusPill status={p.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(p)}><Eye className="mr-2 h-4 w-4" />Переглянути</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(p)}><FilePenLine className="mr-2 h-4 w-4" />Редагувати</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(p)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Видалити</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </main>
  );
}
