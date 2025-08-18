"use client";

import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusPill } from "@/components/status-pill";
import { currency } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { FilePenLine, Trash2 } from "lucide-react";

type Props = {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <h4 className="text-sm text-muted-foreground">{label}</h4>
      <p className="text-md">{value}</p>
    </div>
);

export function ProductDrawer({ product, onClose, onEdit, onDelete }: Props) {
  return (
    <Sheet open={!!product} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[440px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Картка товару</SheetTitle>
          <SheetDescription>ID: {product.id}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-6 pl-1 py-4 space-y-6">
            <div className="relative aspect-video w-full">
                <Image 
                    src={product.images?.[0] || 'https://placehold.co/600x400.png'} 
                    alt={product.name}
                    fill
                    className="rounded-lg object-cover border bg-card" 
                    data-ai-hint={product.category === 'Електроінструмент' ? 'power drill' : product.category === 'Фарби та лаки' ? 'paint can' : product.category === 'Сантехніка' ? 'faucet sink' : 'power outlet'}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <DetailField label="Назва" value={product.name} />
                <DetailField label="SKU" value={product.sku} />
                <DetailField label="Категорія" value={product.category} />
                <DetailField label="Залишок" value={`${product.stock} шт.`} />
                <DetailField label="Ціна" value={currency(product.price)} />
                {product.oldPrice > 0 && <DetailField label="Стара ціна" value={currency(product.oldPrice)} />}
            </div>
            
            <div className="flex items-center gap-4">
                <h4 className="text-sm text-muted-foreground">Статус</h4>
                <StatusPill status={product.status} />
            </div>

            <Separator/>

            <div>
                <h4 className="text-sm text-muted-foreground mb-2">Опис</h4>
                <p className="text-sm leading-relaxed">{product.description || "—"}</p>
            </div>
            
            <div>
                <h4 className="text-sm text-muted-foreground mb-2">Атрибути</h4>
                <div className="text-sm grid grid-cols-2 gap-2">
                  {Object.entries(product.attributes || {}).map(([k, v]) => (
                    <div key={k} className="px-3 py-2 rounded-md bg-muted/50 border">
                        <div className="text-xs text-muted-foreground">{k}</div>
                        <div className="font-medium">{String(v)}</div>
                    </div>
                  ))}
                  {(!product.attributes || Object.keys(product.attributes).length === 0) && <div className="text-muted-foreground text-sm">—</div>}
                </div>
            </div>
             <div className="text-xs text-muted-foreground pt-4">Створено: {new Date(product.createdAt).toLocaleDateString()}</div>
        </div>
        <SheetFooter className="pt-4">
          <Button variant="outline" onClick={() => onEdit(product)}><FilePenLine className="mr-2 h-4 w-4" />Редагувати</Button>
          <Button variant="destructive" onClick={() => onDelete(product)}><Trash2 className="mr-2 h-4 w-4"/>Видалити</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
