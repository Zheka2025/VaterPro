"use client";

import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/types";

type Props = {
  status: ConnectionStatus;
};

export function ConnStatusIndicator({ status }: Props) {
  const color = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500 animate-pulse",
    error: "bg-red-500",
    idle: "bg-gray-400",
  }[status];

  const title = {
    connected: "Підключено",
    connecting: "Підключення...",
    error: "Помилка",
    idle: "Очікування",
  }[status];

  return (
    <span
      className={cn("inline-block w-2.5 h-2.5 rounded-full", color)}
      title={title}
    />
  );
}
