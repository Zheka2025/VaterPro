
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/sidebar";
import { ProductTable } from "@/components/product-table";
import { CategoryManager } from "@/components/category-manager";
import { ProductDrawer } from "@/components/product-drawer";
import { ProductModal } from "@/components/modals/product-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { BulkActionsModal } from "@/components/modals/bulk-actions-modal";
import { DevTestsModal } from "@/components/modals/dev-tests-modal";
import { SettingsModal } from "@/components/modals/settings-modal";
import { SqlRunnerModal } from "@/components/modals/sql-runner-modal";
import { Toolbar } from "@/components/toolbar";
import { useToast } from "@/hooks/use-toast";

import type { Product, Category, ConnectionState, DBSettings, SortState, DBTable, ProductStatus } from "@/lib/types";
import { initialProducts, initialCategories, createBlankProduct, STATUSES } from "@/lib/constants";
import { connectToDb } from "@/app/actions";
import AuthGuard from "@/components/auth-guard";

function Dashboard() {
  const [activeSection, setActiveSection] = useState("products");
  
  const [settings, setSettings] = useState<DBSettings>({ 
    host: "", 
    port: 0, 
    username: "", 
    password: "", 
    database: "tovar.db", 
    azureConnString: "" 
  });
  const [conn, setConn] = useState<ConnectionState>({ status: "idle", message: "" });
  const [tables, setTables] = useState<DBTable[]>([]);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Всі");
  const [statusFilter, setStatusFilter] = useState("Всі");
  const [sort, setSort] = useState<SortState>({ by: "createdAt", dir: "desc" });

  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [modal, setModal] = useState< { mode: string; data?: any } | null>(null);

  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setConn({ status: "connecting", message: "Підключення…" });
      try {
        const res = await connectToDb(settings);
        setConn({ status: "connected", message: res.version });
        setTables(res.tables);
      } catch (e: any) {
        const errorMessage = e.message || "Не вдалося підключитись";
        setConn({ status: "error", message: errorMessage });
        toast({
          variant: "destructive",
          title: "Помилка підключення",
          description: errorMessage,
        });
      }
    })();
  }, []);

  const categoryNames = useMemo(() => ["Всі", ...categories.map(c => c.name)], [categories]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
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

  const upsertProduct = (product: Product) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === product.id);
      if (index === -1) return [product, ...prev];
      const copy = [...prev];
      copy[index] = product;
      return copy;
    });
    if (drawerProduct?.id === product.id) {
      setDrawerProduct(product);
    }
  };

  const addMultipleProducts = (newProducts: Product[]) => {
    setProducts(prev => [...newProducts, ...prev]);
  };

  const deleteProducts = (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    if (drawerProduct && ids.includes(drawerProduct.id)) {
      setDrawerProduct(null);
    }
    setSelectedIds([]);
  };

  const bulkUpdate = (field: "status" | "category", value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id) ? { ...p, [field]: value } : p
      )
    );
  };
  
  const bulkPriceUpdate = (percentage: number) => {
     setProducts((prev) => prev.map((p) => selectedIds.includes(p.id) ? { ...p, price: Math.max(0, Math.round(p.price * (1 - percentage/100))) } : p));
  }

  const handleReconnect = async (newSettings: DBSettings) => {
    setConn({ status: "connecting", message: "Підключення…" });
    try {
      const res = await connectToDb(newSettings);
      setConn({ status: "connected", message: res.version });
      setTables(res.tables);
      setSettings(newSettings);
      setModal(null);
       toast({
        title: "Налаштування збережено",
        description: "Успішно підключено до бази даних.",
      });
    } catch (e: any) {
      const errorMessage = e.message || "Не вдалося підключитись";
      setConn({ status: "error", message: errorMessage });
      setSettings(newSettings); // все одно зберігаємо, щоб користувач бачив що ввів
      toast({
          variant: "destructive",
          title: "Помилка підключення",
          description: errorMessage,
      });
    }
  };

  const mainContent = () => {
    switch (activeSection) {
      case "products":
        return (
          <>
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
              onBulkActions={() => setModal({ mode: "bulk-actions" })}
              onSelectAll={handleSelectAll}
              onClearSelection={() => setSelectedIds([])}
              filteredProductCount={filteredProducts.length}
              openSettings={() => setModal({mode: 'settings'})}
              openSqlRunner={() => setModal({mode: 'sql-runner'})}
              openDevTests={() => setModal({mode: 'dev-tests'})}
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
          </>
        );
      case "categories":
        return <CategoryManager categories={categories} setCategories={setCategories} />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <DashboardSidebar
          connection={conn}
          tables={tables}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <main className="flex-1 flex flex-col overflow-auto">
          {mainContent()}
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
          onSave={(p) => { upsertProduct(p); setModal(null); }}
          categories={categories}
          settings={settings}
        />
      )}

      {modal?.mode === 'delete-product' && (
        <ConfirmModal
          title="Видалити товар?"
          description={`Ви впевнені, що хочете видалити '${modal.data.name}'? Цю дію неможливо скасувати.`}
          onCancel={() => setModal(null)}
          onConfirm={() => { deleteProducts([modal.data.id]); setModal(null); }}
          confirmLabel="Видалити"
        />
      )}

      {modal?.mode === 'bulk-actions' && (
        <BulkActionsModal
          count={selectedIds.length}
          onClose={() => setModal(null)}
          categories={categories}
          onApply={(action, value) => {
            if (action === "status") bulkUpdate("status", value);
            if (action === "category") bulkUpdate("category", value);
            if (action === "price-10") bulkPriceUpdate(10);
            setModal(null);
          }}
          onDelete={() => {
            setModal({ mode: "delete-bulk", data: selectedIds });
          }}
        />
      )}
      
      {modal?.mode === 'delete-bulk' && (
         <ConfirmModal
          title={`Видалити ${modal.data.length} товар(ів)?`}
          description={`Ви впевнені, що хочете видалити обрані товари? Цю дію неможливо скасувати.`}
          onCancel={() => setModal(null)}
          onConfirm={() => { deleteProducts(modal.data); setModal(null); }}
          confirmLabel="Видалити"
        />
      )}

      {modal?.mode === 'dev-tests' && <DevTestsModal onClose={() => setModal(null)} />}
      {modal?.mode === 'settings' && <SettingsModal settings={settings} onClose={() => setModal(null)} onSave={handleReconnect} />}
      {modal?.mode === 'sql-runner' && <SqlRunnerModal products={products} categories={categories} onClose={() => setModal(null)} />}

    </SidebarProvider>
  );
}


export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
