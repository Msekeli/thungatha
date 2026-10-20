"use client";

import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicJobUndoNotice({
  title,
  onUndo,
  onDismiss,
}: {
  title: string;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  return (
    <Snackbar
      open
      autoHideDuration={10000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={(_, reason) => {
        if (reason !== "clickaway") onDismiss();
      }}
      sx={{ zIndex: 1500 }}
    >
      <Paper
        className="th-jobs-undo-snackbar"
        role="status"
        elevation={8}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          maxWidth: "calc(100vw - 24px)",
          p: 1.25,
          border: "1px solid var(--th-line)",
          borderRadius: 2,
          color: "var(--th-fg)",
          bgcolor: "var(--th-panel)",
          boxShadow: "0 8px 28px rgba(0,0,0,.22)",
        }}
      >
        <span>{title} dismissed.</span>
        <Button variant="secondary" onClick={onUndo}>
          Undo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="th-jobs-notice-close"
          aria-label="Dismiss notice"
          onClick={onDismiss}
        >
          <X size={16} />
        </Button>
      </Paper>
    </Snackbar>
  );
}
