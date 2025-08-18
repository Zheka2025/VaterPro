"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { SortState } from "@/lib/types";
import { Beaker, Code, Plus, Settings, SlidersHorizontal, Trash2, Upload } from "lucide-react";

type ToolbarProps = {
  query: string;
  setQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categoryNames: string[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  statuses: string[];
  sort: SortState;
  setSort: (sort: SortState) => void;
  selectedIds: string[];
  onAddNew: () => void;
  onBulkActions: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  filteredProductCount: number;
  openSettings: () => void;
  openSqlRunner: () => void;
  openDevTests: () => void;
};

export function Toolbar({
  query, setQuery,
  categoryFilter, setCategoryFilter, categoryNames,
  statusFilter, setStatusFilter, statuses,
  sort, setSort,
  selectedIds, onAddNew, onBulkActions,
  openSettings, openSqlRunner, openDevTests
}: ToolbarProps) {
  return (
    <div className="bg-card border-b p-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Пошук: назва / SKU / ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Категорія" />
          </SelectTrigger>
          <SelectContent>
            {categoryNames.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" onClick={openSqlRunner} title="SQL Runner"><Code /></Button>
            <Button variant="ghost" size="icon" onClick={openSettings} title="Налаштування"><Settings /></Button>
            <Button variant="ghost" size="icon" onClick={openDevTests} title="Запустити дев-тести"><Beaker /></Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
         <span className="text-sm text-muted-foreground">Сортувати:</span>
         <Select value={sort.by} onValueChange={(val) => setSort({ ...sort, by: val as SortState['by'] })}>
            <SelectTrigger className="w-[140px]">
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="createdAt">Датою</SelectItem>
                <SelectItem value="name">Назвою</SelectItem>
                <SelectItem value="price">Ціною</SelectItem>
                <SelectItem value="stock">Залишком</SelectItem>
                <SelectItem value="category">Категорією</SelectItem>
            </SelectContent>
        </Select>
        <Select value={sort.dir} onValueChange={(val) => setSort({ ...sort, dir: val as 'asc' | 'desc' })}>
            <SelectTrigger className="w-[140px]">
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="desc">↓ Спадання</SelectItem>
                <SelectItem value="asc">↑ Зростання</SelectItem>
            </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {selectedIds.length > 0 && (
          <Button variant="outline" size="sm" onClick={onBulkActions}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Масові дії ({selectedIds.length})
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
            <Link href="/bulk-add">
              <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Масове додавання</Button>
            </Link>
            <Button onClick={onAddNew}><Plus className="mr-2 h-4 w-4"/> Додати товар</Button>
        </div>
      </div>
    </div>
  );
}
