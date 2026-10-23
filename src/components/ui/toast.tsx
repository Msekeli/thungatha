"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ToastProps = {
  message: string;
  tone?: "success" | "error" | "info";
  onDismiss: () => void;
  durationMs?: number;
  action?: ReactNode;
};

export function Toast({
  message,
  tone = "info",
  onDismiss,
  durationMs = 5000,
  action,
}: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs, message, onDismiss]);
  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-[1500] flex w-[min(560px,calc(100vw-24px))] -translate-x-1/2 items-center gap-3 rounded-lg border border-line bg-panel p-3 text-sm text-fg shadow-xl"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span className="min-w-0 flex-1">{message}</span>
      {action}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </Button>
    </div>
  );
}
