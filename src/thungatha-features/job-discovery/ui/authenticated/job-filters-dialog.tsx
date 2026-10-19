import type { FormEvent } from "react";
import Dialog from "@mui/material/Dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AuthenticatedFilterValues = {
  query: string;
  location: string;
  workMode: string;
  employmentType: string;
  publishedWithin: string;
};

type AuthenticatedJobFiltersProps = {
  open: boolean;
  values: AuthenticatedFilterValues;
  onChange: (key: keyof AuthenticatedFilterValues, value: string) => void;
  onClose: () => void;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthenticatedJobFilters({
  open,
  values,
  onChange,
  onClose,
  onClear,
  onSubmit,
}: AuthenticatedJobFiltersProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label="Filter opportunities"
      slotProps={{
        paper: {
          className: "th-jobs-popover th-jobs-filter-popover th-jobs-filter-dialog",
        },
      }}
    >
      <header>
        <strong>Filter opportunities</strong>
        <button type="button" aria-label="Close filters" onClick={onClose}>
          <X size={16} />
        </button>
      </header>
      <form
        onSubmit={(event) => {
          onSubmit(event);
          onClose();
        }}
      >
        <label>
          Search keywords
          <input
            className="th-input"
            value={values.query}
            onChange={(event) => onChange("query", event.target.value)}
            placeholder="e.g. Software Engineer, React, Azure…"
          />
        </label>
        <label>
          Location
          <select
            className="th-input"
            value={values.location}
            onChange={(event) => onChange("location", event.target.value)}
          >
            <option value="">Cape Town + 50 km</option>
            <option value="Cape Town">Cape Town</option>
            <option value="Stellenbosch">Stellenbosch</option>
            <option value="Western Cape">Western Cape</option>
          </select>
        </label>
        <fieldset>
          <legend>Work mode</legend>
          {["onsite", "hybrid", "remote"].map((mode) => (
            <label key={mode}>
              <input
                type="checkbox"
                checked={values.workMode === mode}
                onChange={(event) =>
                  onChange("workMode", event.target.checked ? mode : "")
                }
              />
              {mode === "onsite" ? "On-site" : mode[0].toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Employment type</legend>
          {[
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
            "Learnership",
            "Graduate programme",
          ].map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                checked={values.employmentType === type}
                onChange={(event) =>
                  onChange("employmentType", event.target.checked ? type : "")
                }
              />
              {type}
            </label>
          ))}
        </fieldset>
        <label>
          Posted within
          <select
            className="th-input"
            value={values.publishedWithin}
            onChange={(event) => onChange("publishedWithin", event.target.value)}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>
        <footer>
          <Button type="button" variant="secondary" onClick={onClear}>
            Reset
          </Button>
          <Button type="submit" variant="primary">Apply filters</Button>
        </footer>
      </form>
    </Dialog>
  );
}
