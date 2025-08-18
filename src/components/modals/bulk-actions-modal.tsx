"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES } from "@/lib/constants";
import type { Category } from "@/lib/types";

type Action = "status" | "category" | "price-10";

type Props = {
  count: number;
  onClose: () => void;
  onApply: (action: Action, value: string) => void;
  onDelete: () => void;
  categories: Category[];
};

export function BulkActionsModal({ count, onClose, onApply, onDelete, categories }: Props) {
  const [action, setAction] = useState<Action>("status");
  const [value, setValue] = useState<string>(STATUSES[1]);

  const categoryOptions = categories.map((c) => c.name);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Масові дії для {count} товар(ів)</DialogTitle>
        </DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-4">
          <div>
            <Label>Дія</Label>
            <Select value={action} onValueChange={(val: Action) => setAction(val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Змінити статус</SelectItem>
                <SelectItem value="category">Перенести в категорію</SelectItem>
                <SelectItem value="price-10">Знизити ціну на 10%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Значення</Label>
            {action === "status" && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
            {action === "category" && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
            {action === "price-10" && (<div className="text-muted-foreground text-sm h-10 flex items-center">Буде застосовано.</div>)}
          </div>
        </div>
        <DialogFooter className="justify-between">
            <Button variant="destructive" onClick={onDelete}>Видалити обрані</Button>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Закрити</Button>
                <Button onClick={() => onApply(action, value)}>Застосувати</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
