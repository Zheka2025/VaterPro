
"use client";

import { Box, Package, Settings, Database, Tag, LogOut } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarFooter } from "@/components/ui/sidebar";
import { ConnStatusIndicator } from "@/components/conn-status-indicator";
import type { ConnectionState, DBTable } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  connection: ConnectionState;
  tables: DBTable[];
  activeSection: string;
  setActiveSection: (section: string) => void;
};

export function DashboardSidebar({ connection, tables, activeSection, setActiveSection }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <Sidebar side="left" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Box size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">ShopAdminPro</h2>
            <div className="flex items-center gap-2">
              <ConnStatusIndicator status={connection.status} />
              <span className="text-xs text-muted-foreground">{connection.message}</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveSection("products")}
              isActive={activeSection === "products"}
              tooltip="Products"
            >
              <Package />
              <span>Товари</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveSection("categories")}
              isActive={activeSection === "categories"}
              tooltip="Categories"
            >
              <Tag />
              <span>Категорії</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarGroup>
            <SidebarGroupLabel>Таблиці БД</SidebarGroupLabel>
            <SidebarMenu>
            {tables.map((table) => (
                <SidebarMenuItem key={table.name}>
                    <SidebarMenuButton variant="ghost" className="h-8 justify-start" tooltip={table.label}>
                        <Database size={16} className="text-muted-foreground"/>
                        <span>{table.label}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Вийти">
                    <LogOut />
                    <span>Вийти</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
