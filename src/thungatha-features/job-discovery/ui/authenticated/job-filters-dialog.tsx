import Dialog from "@mui/material/Dialog";
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
  draft: JobFiltersDraft;
  onClose: () => void;
  onChange: (key: keyof JobFiltersDraft, value: string) => void;
  onReset: () => void;
  onApply: () => void;
};

export function JobFiltersDialog({ open, draft, onClose, onChange, onReset, onApply }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      aria-label="Filter opportunities"
      slotProps={{ paper: { className: "th-jobs-popover th-jobs-filter-popover th-jobs-filter-dialog" } }}>
      <header><strong>Filter opportunities</strong>
        <Button variant="ghost" size="sm" aria-label="Close filters" onClick={onClose}><X size={16} /></Button>
      </header>
      <form onSubmit={(event) => { event.preventDefault(); onApply(); }}>
        <label>Search keywords
          <input className="th-input" value={draft.query} onChange={(e) => onChange("query", e.target.value)} placeholder="e.g. Software Engineer, React, Azure…" />
        </label>
        <label>Location
          <select className="th-input" value={draft.location} onChange={(e) => onChange("location", e.target.value)}>
            <option value="Cape Town + 50 km">Cape Town + 50 km</option><option value="Cape Town">Cape Town</option>
            <option value="Johannesburg">Johannesburg</option><option value="Durban">Durban</option>
            <option value="Remote">Remote</option><option value="">Anywhere</option>
          </select>
        </label>
        <fieldset><legend>Work mode</legend>
          {["onsite", "hybrid", "remote"].map((v) => <label key={v}>
            <input type="checkbox" checked={draft.workMode === v} onChange={(e) => onChange("workMode", e.target.checked ? v : "")} />
            {v === "onsite" ? "On-site" : v[0].toUpperCase() + v.slice(1)}
          </label>)}
        </fieldset>
        <fieldset><legend>Employment type</legend>
          {["Full-time", "Part-time", "Contract", "Internship", "Learnership", "Graduate programme"].map((v) => <label key={v}>
            <input type="checkbox" checked={draft.employmentType === v} onChange={(e) => onChange("employmentType", e.target.checked ? v : "")} />{v}
          </label>)}
        </fieldset>
        <label>Posted within
          <select className="th-input" value={draft.publishedWithin} onChange={(e) => onChange("publishedWithin", e.target.value)}>
            <option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option><option value="30d">Last 30 days</option>
          </select>
        </label>
        <footer><Button type="button" variant="secondary" onClick={onReset}>Reset</Button>
          <Button type="submit" variant="primary">Apply filters</Button></footer>
      </form>
    </Dialog>
  );
}
