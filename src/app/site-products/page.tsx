
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/sidebar";
import AuthGuard from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Database, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSiteProducts } from "@/app/actions";
import type { SiteProduct, DBSettings, ConnectionState, DBTable } from "@/lib/types";
import { currency } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function SiteProductsPage() {
    const router = useRouter();
    const { toast } = useToast();

    // We need a separate state for settings as it might differ from the main page's state.
    // Or, we can lift the state up to a shared context if needed later.
    const [settings, setSettings] = useState<DBSettings>({
        host: "", port: 0, username: "", password: "", database: "tovar.db",
        mysqlHost: process.env.NEXT_PUBLIC_MYSQL_HOST || "",
        mysqlUser: process.env.NEXT_PUBLIC_MYSQL_USER || "",
        mysqlPassword: process.env.NEXT_PUBLIC_MYSQL_PASSWORD || "",
        mysqlDatabase: process.env.NEXT_PUBLIC_MYSQL_DATABASE || "",
    });

    const [products, setProducts] = useState<SiteProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mock connection state for the sidebar
    const mockConn: ConnectionState = { status: "connected", message: "MySQL" };
    const mockTables: DBTable[] = [{ name: "product", label: "Товари" }];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const siteProducts = await getSiteProducts(settings);
                setProducts(siteProducts);
            } catch (e: any) {
                setError(e.message || "An unknown error occurred.");
                toast({
                    variant: "destructive",
                    title: "Помилка завантаження товарів",
                    description: e.message,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [settings, toast]);

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background">
                <DashboardSidebar
                    connection={mockConn}
                    tables={mockTables}
                    activeSection=""
                    setActiveSection={() => {}}
                />
                <main className="flex-1 flex flex-col overflow-auto">
                    <div className="container mx-auto py-8">
                        <div className="flex items-center mb-6">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                                <ArrowLeft />
                            </Button>
                            <h1 className="text-2xl font-bold ml-2">Товари з сайту (MySQL)</h1>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Список товарів</CardTitle>
                                <CardDescription>Останні 100 оновлених товарів з бази даних сайту.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-destructive bg-destructive/10 rounded-lg">
                                        <AlertCircle className="h-8 w-8 mb-2" />
                                        <p className="font-semibold">Не вдалося завантажити дані</p>
                                        <p className="text-sm">{error}</p>
                                         <Button variant="outline" className="mt-4" onClick={() => router.push('/')}>На головну</Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Зображення</TableHead>
                                                <TableHead>Назва</TableHead>
                                                <TableHead>Ціна</TableHead>
                                                <TableHead>Залишок</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>
                                                        <Image
                                                            src={p.imageUrl || `https://placehold.co/600x400.png?text=${p.name.charAt(0)}`}
                                                            alt={p.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 rounded-lg object-cover border bg-card"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{p.name}</div>
                                                        <div className="text-xs text-muted-foreground">ID: {p.id}</div>
                                                    </TableCell>
                                                    <TableCell>{currency(Number(p.price))}</TableCell>
                                                    <TableCell>{p.stock}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}


export default function SiteProducts() {
    return (
        <AuthGuard>
            <SiteProductsPage />
        </AuthGuard>
    )
}
