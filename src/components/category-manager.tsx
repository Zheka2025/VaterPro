"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryModal } from "@/components/modals/category-modal";
import type { Category } from "@/lib/types";
import { Plus, FilePenLine, Trash2 } from "lucide-react";

type Props = {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
};

export function CategoryManager({ categories, setCategories }: Props) {
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item: Partial<Category> } | null>(null);

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories((prev) => [{ id: `C-${Math.floor(1000 + Math.random() * 9000)}`, ...category }, ...prev]);
  };

  const updateCategory = (category: Category) => {
    setCategories((prev) => prev.map((x) => (x.id === category.id ? category : x)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const hasChildren = prev.some((c) => c.parentId === id);
      if (hasChildren) {
        alert("Спочатку видаліть або перемістіть підкатегорії.");
        return prev;
      }
      return prev.filter((c) => c.id !== id);
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b bg-card">
        <Button onClick={() => setModal({ mode: 'create', item: { name: '', parentId: null } })}>
            <Plus className="mr-2 h-4 w-4"/> Додати категорію
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary z-10">
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Батьківська категорія</TableHead>
              <TableHead className="text-right w-[200px]">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{categories.find((x) => x.id === c.parentId)?.name || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModal({ mode: 'edit', item: c })}>
                        <FilePenLine className="mr-2 h-4 w-4"/> Редагувати
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCategory(c.id)}>
                        <Trash2 className="mr-2 h-4 w-4"/> Видалити
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {modal && (
        <CategoryModal
          modal={modal}
          onClose={() => setModal(null)}
          onSave={(item) => {
            if (modal.mode === 'create') {
                addCategory(item as Omit<Category, 'id'>);
            } else {
                updateCategory(item as Category);
            }
            setModal(null);
          }}
          categories={categories}
        />
      )}
    </div>
  );
}
