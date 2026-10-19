"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UndoAction = {
  jobId: string;
  title: string;
  previousState: "saved" | "dismissed" | null;
  nextState: "saved" | "dismissed" | null;
};

export function JobUndoNotice({ action, busy, onUndo, onDismiss }: {
  action: UndoAction; busy: boolean; onUndo: () => void; onDismiss: () => void;
}) {
  const status = action.nextState === "saved" ? "saved"
    : action.nextState === "dismissed" ? "dismissed" : "updated";
  return (
    <div className="th-jobs-undo-snackbar" role="status">
      <span>{action.title} {status}.</span>
      <Button variant="secondary" disabled={busy} onClick={onUndo}>Undo</Button>
      <Button variant="ghost" size="sm" type="button" className="th-jobs-notice-close"
        aria-label="Dismiss notice" onClick={onDismiss}>
        <X size={16} />
      </Button>
    </div>
  );
}
