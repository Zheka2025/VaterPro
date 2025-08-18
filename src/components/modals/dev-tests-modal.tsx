"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  onClose: () => void;
};

// Functions from original code
const STATUS = ["Чернетка", "Активний", "Прихований", "Вичерпано"]; 
const DEFAULT_CATEGORIES = ["Будматеріали", "Електроінструмент"];
function createBlankProduct(categories?: { name: string }[]) {
  const id = `P-${Math.floor(1000 + Math.random() * 9000)}`;
  return { id, name: "", sku: "", category: (categories?.[0]?.name) || DEFAULT_CATEGORIES[0], price: 0, oldPrice: 0, stock: 0, status: "Чернетка" as const, images: [], attributes: {}, createdAt: new Date().toISOString().slice(0, 10) };
}
function currency(v: number) { return new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH" }).format(v || 0); }
function classNames(...arr: (string | null | undefined)[]) { return arr.filter(Boolean).join(" "); }

function runDevTests() {
  const tests: { name: string; pass: boolean; message?: string }[] = [];
  const blank = createBlankProduct([{ name: "Кат1" }]);
  tests.push({ name: "createBlankProduct() shape", pass: blank && typeof blank === "object" && String(blank.id || "").startsWith("P-") && blank.status === "Чернетка" && Array.isArray(blank.images) && typeof blank.attributes === "object", message: JSON.stringify(blank) });
  const c = currency(1234); tests.push({ name: "currency() returns string", pass: typeof c === "string" && /\d/.test(c), message: c });
  tests.push({ name: "STATUS is array with 'Активний'", pass: Array.isArray(STATUS) && STATUS.includes("Активний") });
  tests.push({ name: "classNames filters falsy", pass: classNames("a", null, undefined, "b") === "a b", message: classNames("a", null, undefined, "b") });
  const blank2 = createBlankProduct();
  tests.push({ name: "createBlankProduct() fallback category", pass: !!blank2 && !!blank2.category, message: blank2 ? blank2.category : "no" });
  return tests;
}


export function DevTestsModal({ onClose }: Props) {
  const tests = runDevTests();
  const passed = tests.filter((t) => t.pass).length;
  const failed = tests.length - passed;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Dev Tests</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="text-sm text-muted-foreground">
                Усього: {tests.length}, пройдено: {passed}, провалено: {failed}
            </div>
            <ul className="space-y-2">
                {tests.map((t, i) => (
                <li key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${t.pass ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                    {t.pass ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                    <div>
                        <div className="font-medium">{t.name}</div>
                        {t.message && <div className="text-xs mt-1 opacity-80 font-mono">{t.message}</div>}
                    </div>
                </li>
                ))}
            </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
