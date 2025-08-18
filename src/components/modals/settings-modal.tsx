"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DBSettings } from "@/lib/types";

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
        <div className="py-4 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="host">Host</Label>
            <Input id="host" value={s.host} onChange={(e) => set("host", e.target.value)} placeholder="127.0.0.1" />
          </div>
          <div>
            <Label htmlFor="port">Port</Label>
            <Input id="port" type="number" value={s.port} onChange={(e) => set("port", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="username">Користувач</Label>
            <Input id="username" value={s.username} onChange={(e) => set("username", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={s.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="database">База даних</Label>
            <Input id="database" value={s.database} onChange={(e) => set("database", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="azureConnString">Azure Storage (connection string)</Label>
            <Input id="azureConnString" value={s.azureConnString} onChange={(e) => set("azureConnString", e.target.value)} />
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
