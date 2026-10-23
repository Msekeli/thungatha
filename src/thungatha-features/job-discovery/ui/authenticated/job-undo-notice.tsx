"use client";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

export type UndoAction = {
  jobId: string;
  title: string;
  previousState: "saved" | "dismissed" | null;
  nextState: "saved" | "dismissed" | null;
};

export function JobUndoNotice({
  action,
  busy,
  onUndo,
  onDismiss,
}: {
  action: UndoAction;
  busy: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const status =
    action.nextState === "saved"
      ? "saved"
      : action.nextState === "dismissed"
        ? "dismissed"
        : "updated";
  return (
    <Toast
      key={`${action.jobId}-${action.nextState ?? "none"}`}
      message={`${action.title} ${status}.`}
      durationMs={10000}
      onDismiss={onDismiss}
      action={
        <Button variant="secondary" disabled={busy} onClick={onUndo}>
          Undo
        </Button>
      }
    />
  );
}
