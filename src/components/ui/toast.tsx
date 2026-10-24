"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ToastProps = {
  message: string;
  tone?: "success" | "error" | "info" | "warning";
  onDismiss: () => void;
  durationMs?: number;
  action?: ReactNode;
};

export function Toast({ message, tone = "info", onDismiss, durationMs = 5000, action }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs, message, onDismiss]);
  const colors = {
    success: "border-emerald-500/40 bg-emerald-950/95 text-emerald-100",
    error: "border-red-500/40 bg-red-950/95 text-red-100",
    info: "border-sky-500/40 bg-sky-950/95 text-sky-100",
    warning: "border-amber-400/50 bg-amber-950/95 text-amber-100",
  }[tone];
  return <div className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-[1500] flex w-[min(560px,calc(100vw-24px))] -translate-x-1/2 items-center gap-3 rounded-lg border p-3 text-sm shadow-xl backdrop-blur ${colors}`} data-tone={tone} role={tone === "error" ? "alert" : "status"} aria-live="polite">
    <span className="min-w-0 flex-1">{message}</span>{action}
    <Button type="button" variant="ghost" size="sm" aria-label="Dismiss notification" onClick={onDismiss}>×</Button>
  </div>;
}
