"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  tone?: "success" | "error" | "info";
  onDismiss: () => void;
};

export function Toast({ message, tone = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);
  return (
    <div
      className="th-toast"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span className="th-toast-icon" aria-hidden="true">
        {tone === "success" ? "✓" : tone === "error" ? "!" : "i"}
      </span>
      <span className="th-toast-message">{message}</span>
      <button
        type="button"
        className="th-toast-close"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
