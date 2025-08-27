
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DBSettings } from "@/lib/types";
import { Separator } from "../ui/separator";

type Props = {
  settings: DBSettings;
  onClose: () => void;
  onSave: (settings: DBSettings) => void;
};

export function SettingsModal({ settings, onClose, onSave }: Props) {
  const [s, setS] = useState(settings);

  const set = (field: keyof DBSettings, val: string | number) => {
    setS((p) => ({ ...p, [field]: val }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Налаштування підключення</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Локальна база (SQLite)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="database">Файл бази даних</Label>
                <Input id="database" value={s.database} onChange={(e) => set("database", e.target.value)} />
              </div>
            </div>
          </div>
          
          <Separator />

          <div>
             <h3 className="text-lg font-semibold mb-2">База сайту (MySQL)</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mysqlHost">Host</Label>
                  <Input id="mysqlHost" value={s.mysqlHost} onChange={(e) => set("mysqlHost", e.target.value)} placeholder="127.0.0.1" />
                </div>
                <div>
                  <Label htmlFor="mysqlUser">Користувач</Label>
                  <Input id="mysqlUser" value={s.mysqlUser} onChange={(e) => set("mysqlUser", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="mysqlPassword">Пароль</Label>
                  <Input id="mysqlPassword" type="password" value={s.mysqlPassword} onChange={(e) => set("mysqlPassword", e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="mysqlDatabase">База даних</Label>
                  <Input id="mysqlDatabase" value={s.mysqlDatabase} onChange={(e) => set("mysqlDatabase", e.target.value)} />
                </div>
             </div>
          </div>
          
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Скасувати</Button>
          <Button onClick={() => onSave(s)}>Зберегти і підключитись</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
