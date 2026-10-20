"use client";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, X } from "lucide-react";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  busy: boolean;
  jobTitle: string;
  employer: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ApplicationConfirmationDialog({
  open,
  anchorEl,
  busy,
  jobTitle,
  employer,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Popper
      open={open && Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 1500, maxWidth: "calc(100vw - 24px)" }}
      modifiers={[
        { name: "offset", options: { offset: [0, 8] } },
        { name: "flip", enabled: true, options: { padding: 12 } },
        {
          name: "preventOverflow",
          enabled: true,
          options: { padding: 12, altAxis: true },
        },
      ]}
    >
      <ClickAwayListener
        onClickAway={(event) => {
          if (anchorEl?.contains(event.target as Node)) return;
          onClose();
        }}
      >
        <Paper
          className="th-jobs-popover th-jobs-apply-popover"
          role="dialog"
          aria-label="Application confirmation"
          elevation={8}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          sx={{
            boxSizing: "border-box",
            width: "min(400px, calc(100vw - 24px))",
            maxHeight: "min(72dvh, 520px)",
            overflowY: "auto",
            border: "1px solid var(--th-line)",
            borderRadius: 3,
            bgcolor: "var(--th-panel)",
            color: "var(--th-fg)",
            boxShadow: "0 16px 44px rgba(0,0,0,.22)",
            "& > header": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: 2,
              py: 1.5,
              borderBottom: "1px solid var(--th-line)",
            },
            "& .th-jobs-apply-confirm": {
              p: 2,
              "& h3": { mt: 0, mb: 1, fontSize: "1rem", fontWeight: 700 },
              "& p": {
                mt: 0,
                mb: 2,
                color: "var(--th-fg-muted)",
                lineHeight: 1.65,
              },
              "& > div": {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: 1,
              },
              "& aside": {
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "var(--th-tag-bg)",
                color: "var(--th-fg-muted)",
                fontSize: 13,
                lineHeight: 1.6,
              },
            },
          }}
        >
          <header>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 650,
              }}
            >
              <BriefcaseBusiness size={18} /> Application status
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close application confirmation"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </header>
          <div className="th-jobs-apply-confirm">
            <h3>Did you apply?</h3>
            <p>
              You opened the application page for <strong>{jobTitle}</strong> at{" "}
              <strong>{employer}</strong>. Have you submitted your application?
            </p>
            <div>
              <Button variant="secondary" disabled={busy} onClick={onClose}>
                Not yet
              </Button>
              <Button variant="primary" disabled={busy} onClick={onConfirm}>
                {busy ? "Saving…" : "Yes, I applied"}
              </Button>
            </div>
            <aside>
              This will be recorded in your{" "}
              <Link href="/tracking">Job Tracking</Link> so you can follow up
              later.
            </aside>
          </div>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
