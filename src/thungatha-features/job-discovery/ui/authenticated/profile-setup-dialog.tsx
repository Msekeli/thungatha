"use client";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onCreateProfile: () => void;
};

export function ProfileSetupDialog({
  open,
  anchorEl,
  onClose,
  onCreateProfile,
}: Props) {
  return (
    <Popper
      open={open && Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="right-start"
      sx={{ zIndex: 1500, maxWidth: "calc(100vw - 24px)" }}
      modifiers={[
        { name: "offset", options: { offset: [10, 0] } },
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
          aria-label="Set up your job profile"
          elevation={8}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          sx={{
            boxSizing: "border-box",
            width: "min(360px, calc(100vw - 24px))",
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
            },
            "& .th-jobs-prompt-actions": {
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
            },
          }}
        >
          <header>
            <strong>Get better job matches</strong>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Dismiss profile setup"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </header>
          <div className="th-jobs-match-placeholder">
            <h3>Set up your profile</h3>
            <p>
              Add your experience, skills and career preferences so Thungatha
              can help you find relevant opportunities and prepare your CV for
              each role.
            </p>
            <div className="th-jobs-prompt-actions">
              <Button variant="secondary" onClick={onClose}>
                Do this later
              </Button>
              <Button variant="primary" onClick={onCreateProfile}>
                Create my profile
              </Button>
            </div>
          </div>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
