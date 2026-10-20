import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

const workModes = ["onsite", "hybrid", "remote"];
const employmentTypes = ["Full-time", "Part-time", "Contract", "Internships", "Learnerships", "Graduate programmes"];

export function JobFiltersDialog({ open, anchorEl, draft, onClose, onChange, onReset, onApply }: Props) {
  return (
    <Popper
      open={open && Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 1500, maxWidth: "calc(100vw - 24px)" }}
      modifiers={[
        { name: "offset", options: { offset: [0, 8] } },
        { name: "flip", enabled: true, options: { padding: 12 } },
        { name: "preventOverflow", enabled: true, options: { padding: 12, altAxis: true } },
      ]}
    >
      <ClickAwayListener onClickAway={(event) => {
        if (anchorEl?.contains(event.target as Node)) return;
        onClose();
      }}>
        <Paper
          className="th-jobs-popover th-jobs-filter-popover th-jobs-filter-dialog"
          role="dialog"
          aria-label="Filter opportunities"
          elevation={8}
          onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}
          sx={{
            boxSizing: "border-box",
            width: "min(560px, calc(100vw - 24px))",
            maxHeight: "min(80dvh, 680px)",
            overflowY: "auto",
            p: { xs: 1.5, sm: 2 },
            color: "var(--th-fg)",
            bgcolor: "var(--th-panel)",
            border: "1px solid var(--th-line)",
            borderRadius: "var(--th-radius-panel)",
            boxShadow: "0 24px 64px rgba(0,0,0,.22)",
            "& header": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 2,
              pb: 1.25,
              borderBottom: "1px solid var(--th-line)",
            },
            "& form": { display: "grid", gap: 1.5 },
            "& form > label": { display: "grid", gap: 0.75, fontSize: 13 },
            "& .th-input": { width: "100%", minWidth: 0, boxSizing: "border-box" },
            "& fieldset": {
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              p: 1.25,
              m: 0,
              border: "1px solid var(--th-line)",
              borderRadius: 2,
            },
            "& fieldset label": { display: "flex", alignItems: "center", gap: 0.5 },
            "& legend": { px: 0.5, fontSize: 13 },
            "& footer": {
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              pt: 1.25,
              borderTop: "1px solid var(--th-line)",
            },
          }}
        >
          <header>
            <strong>Filter opportunities</strong>
            <Button variant="ghost" size="sm" aria-label="Close filters" onClick={onClose}><X size={16} /></Button>
          </header>
          <form onSubmit={(event) => { event.preventDefault(); onApply(); }}>
            <label>Search keywords<input className="th-input" value={draft.query} onChange={(e) => onChange("query", e.target.value)} placeholder="e.g. Software Engineer, React, Azure…" /></label>
            <label>Location<select className="th-input" value={draft.location} onChange={(e) => onChange("location", e.target.value)}>
              <option value="Cape Town + 50 km">Cape Town + 50 km</option><option value="Cape Town">Cape Town</option><option value="Johannesburg">Johannesburg</option><option value="Durban">Durban</option><option value="Remote">Remote</option><option value="">Anywhere</option>
            </select></label>
            <fieldset><legend>Work mode</legend>{workModes.map((v) => <label key={v}><input type="checkbox" checked={draft.workMode === v} onChange={(e) => onChange("workMode", e.target.checked ? v : "")} />{v === "onsite" ? "On-site" : v[0].toUpperCase() + v.slice(1)}</label>)}</fieldset>
            <fieldset><legend>Employment type</legend>{employmentTypes.map((v) => <label key={v}><input type="checkbox" checked={draft.employmentType === v} onChange={(e) => onChange("employmentType", e.target.checked ? v : "")} />{v}</label>)}</fieldset>
            <label>Posted within<select className="th-input" value={draft.publishedWithin} onChange={(e) => onChange("publishedWithin", e.target.value)}>
              <option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="14d">Last 14 days</option><option value="30d">Last 30 days</option>
            </select></label>
            <footer><Button type="button" variant="secondary" onClick={onReset}>Reset</Button><Button type="submit" variant="primary">Apply filters</Button></footer>
          </form>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
