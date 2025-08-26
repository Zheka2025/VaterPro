
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation';

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/sidebar";
import AuthGuard from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSiteProducts } from "@/app/actions";
import type { SiteProduct, DBSettings, ConnectionState, DBTable, SortState, Category } from "@/lib/types";
import { Toolbar } from "@/components/toolbar";
import { ProductTable } from "@/components/product-table";
import { ProductDrawer } from "@/components/product-drawer";
import { ProductModal } from "@/components/modals/product-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { BulkActionsModal } from "@/components/modals/bulk-actions-modal";
import { Product } from "@/lib/types";
import { createBlankProduct, initialCategories, STATUSES } from "@/lib/constants";

// Helper function to adapt SiteProduct to the Product format used by components
const adaptSiteProductToProduct = (siteProduct: SiteProduct): Product => ({
    id: String(siteProduct.id),
    name: siteProduct.name,
    sku: String(siteProduct.id), // Assuming SKU can be the ID if not present
    category: 'Uncategorized', // Default category
    price: Number(siteProduct.price),
    oldPrice: 0,
    stock: siteProduct.stock,
    status: siteProduct.stock > 0 ? 'Активний' : 'Вичерпано',
    images: siteProduct.imageUrl ? [siteProduct.imageUrl] : [],
    description: '', // Not available in SiteProduct
    attributes: {}, // Not available in SiteProduct
    createdAt: new Date().toISOString(), // Placeholder
});


function SiteProductsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [settings, setSettings] = useState<DBSettings>({
        host: "", port: 0, username: "", database: "tovar.db",
        mysqlHost: process.env.NEXT_PUBLIC_MYSQL_HOST || "194.1.182.211",
        mysqlUser: process.env.NEXT_PUBLIC_MYSQL_USER || "vate_vaterpas",
        mysqlPassword: process.env.NEXT_PUBLIC_MYSQL_PASSWORD || "!1205Zhekaaa",
        mysqlDatabase: process.env.NEXT_PUBLIC_MYSQL_DATABASE || "vate_vaterpas",
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for UI components
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Всі");
    const [statusFilter, setStatusFilter] = useState("Всі");
    const [sort, setSort] = useState<SortState>({ by: "createdAt", dir: "desc" });
    const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
    const [modal, setModal] = useState< { mode: string; data?: any } | null>(null);
     const [categories, setCategories] = useState<Category[]>(initialCategories);

    // Mock connection state for the sidebar
    const mockConn: ConnectionState = { status: "connected", message: "MySQL" };
    const mockTables: DBTable[] = [{ name: "product", label: "Товари" }];
    
    const categoryNames = useMemo(() => ["Всі", ...categories.map(c => c.name)], [categories]);


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const siteProducts = await getSiteProducts(settings);
                setProducts(siteProducts.map(adaptSiteProductToProduct));
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
    
    const filteredProducts = useMemo(() => {
        let list = [...products];
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
        }
        if (categoryFilter !== "Всі") list = list.filter((p) => p.category === categoryFilter);
        if (statusFilter !== "Всі") list = list.filter((p) => p.status === statusFilter);

        list.sort((a, b) => {
          const dir = sort.dir === "asc" ? 1 : -1;
          const valA = a[sort.by as keyof Product];
          const valB = b[sort.by as keyof Product];
          if (sort.by === "price" || sort.by === "stock") {
            return (Number(valA) - Number(valB)) * dir;
          }
          return String(valA).localeCompare(String(valB)) * dir;
        });
        return list;
    }, [products, query, categoryFilter, statusFilter, sort]);

    const handleSelectProduct = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if(selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map((p) => p.id));
        }
    };
    
    // Mock implementations for actions
    const upsertProduct = (product: Product) => {
        // Here you would call a server action to update the product in MySQL
        console.log("Saving product to MySQL (simulated):", product);
        toast({ title: "Збережено (симуляція)", description: `Товар ${product.name} оновлено.` });
        setProducts(prev => {
            const index = prev.findIndex(p => p.id === product.id);
            if (index > -1) {
                const newList = [...prev];
                newList[index] = product;
                return newList;
            }
            return [product, ...prev]; // Or handle new product case
        });
        setModal(null);
    };

    const deleteProducts = (ids: string[]) => {
        // Here you would call a server action to delete products from MySQL
        console.log("Deleting products from MySQL (simulated):", ids);
        toast({ title: "Видалено (симуляція)", description: `Видалено ${ids.length} товар(ів).` });
        setProducts(prev => prev.filter(p => !ids.includes(p.id)));
        setSelectedIds([]);
        setModal(null);
    };


    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background">
                <DashboardSidebar
                    connection={mockConn}
                    tables={mockTables}
                    activeSection="site-products"
                    setActiveSection={() => {}}
                />
                <main className="flex-1 flex flex-col overflow-auto">
                   <Toolbar
                      query={query}
                      setQuery={setQuery}
                      categoryFilter={categoryFilter}
                      setCategoryFilter={setCategoryFilter}
                      categoryNames={categoryNames}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      statuses={["Всі", ...STATUSES]}
                      sort={sort}
                      setSort={setSort}
                      selectedIds={selectedIds}
                      onAddNew={() => setModal({ mode: "edit-product", data: createBlankProduct(categories) })}
                      onBulkActions={() => alert("Масові дії для товарів сайту ще не реалізовано.")}
                      onSelectAll={handleSelectAll}
                      onClearSelection={() => setSelectedIds([])}
                      filteredProductCount={filteredProducts.length}
                      totalDbProductCount={products.length}
                      openSettings={() => alert("Налаштування тут недоступні")}
                      openSqlRunner={() => alert("SQL Runner тут недоступний")}
                      openDevTests={() => alert("Dev Tests тут недоступні")}
                    />
                    <ProductTable
                      products={filteredProducts}
                      selectedIds={selectedIds}
                      onSelect={handleSelectProduct}
                      onSelectAll={handleSelectAll}
                      onView={(p) => setDrawerProduct(p)}
                      onEdit={(p) => setModal({ mode: "edit-product", data: p })}
                      onDelete={(p) => setModal({ mode: "delete-product", data: p })}
                    />
                </main>
                 {drawerProduct && (
                  <ProductDrawer
                    product={drawerProduct}
                    onClose={() => setDrawerProduct(null)}
                    onEdit={(p) => { setDrawerProduct(null); setModal({ mode: "edit-product", data: p }); }}
                    onDelete={(p) => { setDrawerProduct(null); setModal({ mode: "delete-product", data: p }); }}
                  />
                )}
            </div>
            
            {modal?.mode === 'edit-product' && (
                <ProductModal
                  product={modal.data}
                  onClose={() => setModal(null)}
                  onSave={upsertProduct}
                  categories={categories}
                  settings={settings}
                />
            )}

            {modal?.mode === 'delete-product' && (
                <ConfirmModal
                  title="Видалити товар з сайту?"
                  description={`Ви впевнені, що хочете видалити '${modal.data.name}'? Цю дію неможливо скасувати.`}
                  onCancel={() => setModal(null)}
                  onConfirm={() => deleteProducts([modal.data.id])}
                  confirmLabel="Видалити"
                />
            )}
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
