"use client";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { JobFilterFields } from "../shared/job-filter-fields";

export type JobFiltersDraft = {
  query: string;
  location: string;
  workMode: string;
  employmentType: string;
  publishedWithin: string;
};

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  draft: JobFiltersDraft;
  onClose: () => void;
  onChange: (key: keyof JobFiltersDraft, value: string) => void;
  onReset: () => void;
  onApply: () => void;
};

function canonicalEmploymentType(value: string) {
  if (!value) return "all";
  const normalized = value.toLowerCase().replace(/[ -]+/g, "_");
  if (normalized.includes("graduate")) return "graduate";
  if (normalized.includes("learnership")) return "learnership";
  if (normalized.includes("intern")) return "internship";
  return EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === normalized)?.value ?? normalized;
}


export function JobFiltersDialog({ open, anchorEl, draft, onClose, onChange, onReset, onApply }: Props) {
  return (
    <Popper open={open && Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start"
      sx={{ zIndex: 1500, maxWidth: "calc(100vw - 24px)" }}
      modifiers={[
        { name: "offset", options: { offset: [0, 8] } },
        { name: "flip", enabled: true, options: { padding: 12 } },
        { name: "preventOverflow", enabled: true, options: { padding: 12, altAxis: true } },
      ]}>
      <ClickAwayListener onClickAway={(event) => {
        if (anchorEl?.contains(event.target as Node)) return;
        onClose();
      }}>
        <Paper className="th-jobs-popover th-jobs-filter-popover th-jobs-filter-dialog"
          role="dialog" aria-label="Filter opportunities" elevation={8}
          onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}
          sx={{
            boxSizing: "border-box", width: "min(340px, calc(100vw - 24px))",
            maxHeight: "min(78dvh, 620px)", overflowY: "auto", p: { xs: 1.5, sm: 2 },
            color: "var(--th-fg)", bgcolor: "var(--th-panel)", border: "1px solid var(--th-line)",
            borderRadius: "var(--th-radius-panel)", boxShadow: "0 16px 44px rgba(0,0,0,.22)",
            "& header": { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5, pb: 1.25, borderBottom: "1px solid var(--th-line)" },
            "& footer": { display: "flex", justifyContent: "space-between", gap: 1, pt: 1.25, mt: 1.5, borderTop: "1px solid var(--th-line)" },
          }}>
          <header><strong>Filter opportunities</strong><Button variant="ghost" size="sm" aria-label="Close filters" onClick={onClose}><X size={16} /></Button></header>
          <JobFilterFields
            workMode={draft.workMode}
            onWorkModeChange={(value) => onChange("workMode", String(value))}
            employmentType={canonicalEmploymentType(draft.employmentType)}
            onEmploymentTypeChange={(value) => onChange("employmentType", value === "all" ? "" : value)}
            publishedWithin={draft.publishedWithin}
            onPublishedWithinChange={(value) => onChange("publishedWithin", value)}
          />
          <footer>
            <Button type="button" variant="secondary" onClick={onReset}>Reset</Button>
            <Button type="button" variant="primary" onClick={onApply}>Apply filters</Button>
          </footer>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
