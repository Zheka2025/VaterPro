"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAiGeneratedSql } from "@/app/actions";
import type { Product, Category } from "@/lib/types";
import { Loader2, Wand2, Play } from "lucide-react";

type Props = {
  onClose: () => void;
  products: Product[];
  categories: Category[];
};

export function SqlRunnerModal({ onClose, products, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [nl, setNl] = useState("");
  const [sql, setSql] = useState("SELECT * FROM product;");
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const generate = () => {
    startTransition(async () => {
      const schema = `
        Table: product(id, name, sku, category, price, stock, status, description, attributes, createdAt)
        Table: category(id, name, parentId)
      `;
      const resultSql = await getAiGeneratedSql({ query: nl, schema });
      setSql(resultSql);
    });
  };

  const execute = () => {
    const text = (sql || "").trim().toLowerCase();
    if (text.startsWith("select") && text.includes("from product")) {
      const cols = ["id", "name", "sku", "category", "price", "stock", "status"];
      const data = products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock, status: p.status }));
      setColumns(cols); setRows(data);
    } else if (text.includes("from category")) {
      const cols = ["id", "name", "parentId"];
      const data = categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId || "" }));
      setColumns(cols); setRows(data);
    } else {
      setColumns(["result"]);
      setRows([{ result: "Demo executor не розуміє цей запит." }]);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>SQL Runner</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 pt-4">
          <div>
            <Label htmlFor="nl-query">Запит природною мовою</Label>
            <Textarea id="nl-query" rows={6} value={nl} onChange={(e) => setNl(e.target.value)} placeholder="напр. покажи всі товари з категорії 'Фарби та лаки'" />
            <Button onClick={generate} className="mt-2" variant="outline" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
              Згенерувати SQL
            </Button>
          </div>
          <div>
            <Label htmlFor="sql-query">SQL</Label>
            <Textarea id="sql-query" rows={6} value={sql} onChange={(e) => setSql(e.target.value)} />
            <Button onClick={execute} className="mt-2">
              <Play className="mr-2 h-4 w-4" />
              Виконати
            </Button>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 max-h-[40vh] overflow-auto">
            {rows.length > 0 ? (
                <Table>
                <TableHeader className="sticky top-0 bg-secondary">
                    <TableRow>{columns.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r, i) => (
                    <TableRow key={i}>{columns.map((c) => <TableCell key={c}>{String(r[c] ?? "")}</TableCell>)}</TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-8">Результатів немає.</div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
