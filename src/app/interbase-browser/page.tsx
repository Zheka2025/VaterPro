
"use client";

import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Barcode, Loader2, PlusCircle, ServerCrash, Terminal } from "lucide-react";
import { getProductFromInterbase } from "@/app/actions";
import type { InterbaseProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


function InterbaseBrowserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSearching, startSearchTransition] = useTransition();
  const [barcode, setBarcode] = useState("");
  const [foundProducts, setFoundProducts] = useState<InterbaseProduct[]>([]);
  const [logs, setLogs] = useState<string[]>(["Ініціалізація..."]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  }

  const handleSearch = () => {
    if (!barcode.trim()) return;
    setError(null);
    addLog(`Пошук штрих-коду: ${barcode}...`);
    console.log(`[BROWSER LOG] Starting search for barcode: ${barcode}`);

    startSearchTransition(async () => {
      try {
        const product = await getProductFromInterbase(barcode);
        console.log("[BROWSER LOG] Received response from server:", product);

        if (product) {
          addLog(`Знайдено: ${product.NAME} (Ціна: ${product.PRC}, Залишок: ${product.REM_KOL})`);
          if (!foundProducts.some(p => p.ID === product.ID)) {
             setFoundProducts(prev => [product, ...prev]);
          } else {
             const message = `Товар з штрих-кодом ${barcode} вже є у списку.`;
             addLog(message);
             console.warn(`[BROWSER LOG] ${message}`);
             toast({
              variant: "default",
              title: "Товар вже у списку",
              description: `Товар з штрих-кодом ${barcode} вже додано.`,
            });
          }
        } else {
          const message = `Товар з штрих-кодом ${barcode} не знайдено.`;
          addLog(message);
          console.log(`[BROWSER LOG] ${message}`);
          toast({
            variant: "destructive",
            title: "Товар не знайдено",
            description: `Товар з штрих-кодом ${barcode} не знайдено в базі SKLAD.GDB.`,
          });
        }
        setBarcode(""); // Clear input after search
      } catch (e: any) {
        console.error("[BROWSER LOG] Failed to search in Interbase:", e);
        const errorMessage = "Не вдалося виконати пошук в базі. Перевірте, чи запущено Firebird сервер, чи правильний шлях до файлу бази даних, а також логін та пароль.";
        setError(errorMessage);
        addLog(`Помилка: ${errorMessage}`);
        toast({
            variant: "destructive",
            title: "Помилка доступу до бази",
            description: "Не вдалося виконати пошук в SKLAD.GDB. Перевірте налаштування підключення.",
        });
      }
    });
  };

  const handleBarcodeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };
  
  const handleAddToMysql = (product: InterbaseProduct) => {
      toast({
          title: "Функціонал у розробці",
          description: `Товар '${product.NAME}' буде додаватися до основної бази даних MySQL.`
      });
      addLog(`(Симуляція) Додавання товару '${product.NAME}' до бази MySQL.`);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Перегляд бази магазину (SKLAD.GDB)</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Пошук товару за штрих-кодом</CardTitle>
          <CardDescription>Введіть або відскануйте штрих-код для пошуку в локальній базі даних Interbase. Спробуйте `2000000012345`.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBarcodeFormSubmit} className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="barcode">Штрих-код (ID)</Label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="barcode"
                  placeholder="Скануйте або введіть штрих-код..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="pl-10"
                  disabled={isSearching}
                  autoFocus
                />
                {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
              </div>
            </div>
            <Button type="submit" disabled={isSearching || !barcode.trim()}>Знайти</Button>
          </form>
           {error && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive-foreground flex items-start gap-3">
                <ServerCrash className="h-5 w-5 text-destructive mt-0.5"/>
                <div>
                    <h4 className="font-semibold">Помилка підключення до бази</h4>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
           )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Знайдені товари</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>ID (Штрих-код)</TableHead>
                        <TableHead>Назва (NAME)</TableHead>
                        <TableHead>Ціна (PRC)</TableHead>
                        <TableHead>Залишок (REM_KOL)</TableHead>
                        <TableHead className="w-[100px] text-right">Дії</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {foundProducts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            {isSearching ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : "Список порожній. Відскануйте штрих-код, щоб знайти товар."}
                            </TableCell>
                        </TableRow>
                        ) : (
                        foundProducts.map((product) => (
                            <TableRow key={product.ID}>
                            <TableCell className="font-mono">{product.ID}</TableCell>
                            <TableCell className="font-medium">{product.NAME}</TableCell>
                            <TableCell>{product.PRC}</TableCell>
                            <TableCell>{product.REM_KOL}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" onClick={() => handleAddToMysql(product)}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Додати
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
        </div>
        <div>
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Terminal className="h-5 w-5 text-muted-foreground"/>
                    <CardTitle>Логи симуляції</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/50 rounded-lg p-3 h-96 overflow-y-auto flex flex-col-reverse">
                       <pre className="text-xs whitespace-pre-wrap font-mono">
                         {logs.map((log, i) => <div key={i}>{log}</div>)}
                       </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}


export default function InterbaseBrowser() {
    return (
        <AuthGuard>
            <InterbaseBrowserPage/>
        </AuthGuard>
    )
}
