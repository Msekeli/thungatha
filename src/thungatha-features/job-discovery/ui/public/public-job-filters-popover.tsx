"use client";

import type { ReactNode } from "react";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicJobFiltersPopover({
  anchorEl,
  onClose,
  children,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{
        zIndex: 1400,
        maxWidth: "calc(100vw - 24px)",
      }}
      modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
    >
      <ClickAwayListener
        onClickAway={(event) => {
          if (anchorEl?.contains(event.target as Node)) return;
          onClose();
        }}
      >
        <Paper
          className="th-jobs-popover th-public-filter-popover"
          role="dialog"
          aria-label="Filter opportunities"
          elevation={8}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          sx={{
            width: "min(560px, calc(100vw - 24px))",
            maxHeight: "min(80dvh, 680px)",
            overflowY: "auto",
            p: 2,
            color: "var(--th-fg)",
            bgcolor: "var(--th-panel)",
            border: "1px solid var(--th-line)",
            borderRadius: "var(--th-radius-panel)",
            boxShadow: "0 12px 36px rgba(0,0,0,.2)",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <strong>Filter opportunities</strong>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label="Close filters"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </header>
          {children}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
