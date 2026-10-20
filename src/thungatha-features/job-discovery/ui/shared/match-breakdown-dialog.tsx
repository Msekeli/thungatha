"use client";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function MatchBreakdownDialog({ open, anchorEl, onClose }: Props) {
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
          className="th-jobs-popover th-jobs-match-popover"
          role="dialog"
          aria-label="Profile match breakdown"
          elevation={8}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          sx={{
            boxSizing: "border-box",
            width: "min(380px, calc(100vw - 24px))",
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
            "& .th-jobs-match-placeholder": {
              p: 2,
              "& h3": { mt: 0, mb: 1, fontSize: "1rem", fontWeight: 700 },
              "& p": {
                mt: 0,
                mb: 2,
                color: "var(--th-fg-muted)",
                lineHeight: 1.65,
              },
              "& ul": {
                pl: 2.5,
                mb: 0,
                color: "var(--th-fg-muted)",
                lineHeight: 1.8,
              },
            },
          }}
        >
          <header>
            <strong>Profile match breakdown</strong>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close match breakdown"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </header>
          <div className="th-jobs-match-placeholder">
            <h3>Job matching is coming soon</h3>
            <p>
              Matching requires a completed profile with your skills and
              experience. No score is calculated or implied. Complete your
              profile so it is ready when matching launches.
            </p>
            <ul>
              <li>Confirmed — evidence from your profile</li>
              <li>Inferred — possible match based on related experience</li>
              <li>Missing — not found in your profile</li>
              <li>Can’t verify — not enough information</li>
            </ul>
          </div>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
