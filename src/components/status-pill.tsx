"use client";

import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/lib/types";

type Props = {
  status: ProductStatus;
};

export function StatusPill({ status }: Props) {
  const variant = {
    "Активний": "default",
    "Вичерпано": "destructive",
    "Прихований": "secondary",
    "Чернетка": "outline",
  }[status] as "default" | "destructive" | "secondary" | "outline";
  
  const colorClass = {
    "Активний": "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    "Вичерпано": "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    "Прихований": "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    "Чернетка": "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  }[status];

  return <Badge className={colorClass} variant="outline">{status}</Badge>;
}
