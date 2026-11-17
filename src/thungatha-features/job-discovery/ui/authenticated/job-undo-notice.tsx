"use client";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

export type UndoAction = {
  jobId: string;
  title: string;
  employerName: string;
  dismissalScope: "job" | "employer";
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
  const message =
    action.nextState === "dismissed" && action.dismissalScope === "employer"
      ? `${action.employerName} dismissed. All jobs from this company are hidden.`
      : action.nextState === "dismissed"
        ? `${action.title} dismissed.`
        : action.nextState === "saved"
          ? `${action.title} saved.`
          : `${action.title} updated.`;
  return (
    <Toast
      key={`${action.jobId}-${action.nextState ?? "none"}-${action.dismissalScope}`}
      message={message}
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
