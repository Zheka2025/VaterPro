"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/lib/types";

type Props = {
  modal: { mode: "create" | "edit"; item: Partial<Category> };
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
  categories: Category[];
};

export function CategoryModal({ modal, onClose, onSave, categories }: Props) {
  const [name, setName] = useState(modal.item.name || "");
  const [parentId, setParentId] = useState(modal.item.parentId || null);

  const topLevelCategories = categories.filter((c) => c.parentId == null && c.id !== modal.item.id);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...(modal.item.id && { id: modal.item.id }),
      name,
      parentId,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modal.mode === 'create' ? 'Створити категорію' : 'Редагувати категорію'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="name">Назва</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="parentId">Батьківська категорія (1 рівень)</Label>
            <Select value={parentId || ''} onValueChange={(value) => setParentId(value || null)}>
              <SelectTrigger id="parentId">
                <SelectValue placeholder="— немає —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— немає —</SelectItem>
                {topLevelCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Скасувати</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Зберегти</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
