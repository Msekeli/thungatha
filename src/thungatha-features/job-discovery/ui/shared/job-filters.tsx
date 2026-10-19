import type { FormEvent } from "react";
import Dialog from "@mui/material/Dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Search } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
  count: number;
};

type JobFiltersProps = {
  query: string;
  location: string;
  typesSelected: string[];
  modesSelected: string[];
  salary: string;
  experience: string;
  types: FilterOption[];
  modes: FilterOption[];
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onToggleType: (value: string) => void;
  onToggleMode: (value: string) => void;
  onSalaryChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
};

export function JobFilters({
  query,
  location,
  typesSelected,
  modesSelected,
  salary,
  experience,
  types,
  modes,
  onQueryChange,
  onLocationChange,
  onToggleType,
  onToggleMode,
  onSalaryChange,
  onExperienceChange,
  onClear,
  onApply,
}: JobFiltersProps) {
  return (
    <div className="th-filter-content">
      <div className="th-filter-title">
        <strong>Filters</strong>
        <button type="button" onClick={onClear}>Clear all</button>
      </div>

      <label className="th-filter-label" htmlFor="th-job-search">Search</label>
      <div className="th-filter-search">
        <Search size={15} aria-hidden="true" />
        <input
          id="th-job-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Job title, skills or company..."
        />
      </div>

      <label className="th-filter-label" htmlFor="th-location">Location</label>
      <div className="th-filter-select">
        <MapPin size={14} aria-hidden="true" />
        <select
          id="th-location"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
        >
          <option>Cape Town + 50 km</option>
          <option>Cape Town</option>
          <option>Johannesburg</option>
          <option>Durban</option>
          <option>Remote</option>
          <option value="">Anywhere</option>
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </div>

      <div className="th-filter-group">
        <strong>Job type</strong>
        {types.map((type) => (
          <label className="th-check-row" key={type.value}>
            <input
              type="checkbox"
              checked={typesSelected.includes(type.value)}
              onChange={() => onToggleType(type.value)}
            />
            <span>{type.label}</span>
            <small>{type.count}</small>
          </label>
        ))}
      </div>

      <div className="th-filter-group">
        <strong>Remote options</strong>
        {modes.map((mode) => (
          <label className="th-check-row" key={mode.value}>
            <input
              type="checkbox"
              checked={modesSelected.includes(mode.value)}
              onChange={() => onToggleMode(mode.value)}
            />
            <span>{mode.label}</span>
            <small>{mode.count}</small>
          </label>
        ))}
      </div>

      <label className="th-filter-label" htmlFor="th-salary">Salary range</label>
      <select
        id="th-salary"
        className="th-filter-native-select"
        value={salary}
        onChange={(event) => onSalaryChange(event.target.value)}
      >
        <option value="any">Any salary</option>
        <option value="disclosed">Salary disclosed</option>
        <option value="above50">R500,000+ per year</option>
      </select>

      <label className="th-filter-label" htmlFor="th-experience">Experience level</label>
      <select
        id="th-experience"
        className="th-filter-native-select"
        value={experience}
        onChange={(event) => onExperienceChange(event.target.value)}
      >
        <option value="any">Any level</option>
        <option value="entry">Entry level</option>
        <option value="mid">Mid-level</option>
        <option value="senior">Senior</option>
      </select>

      <button className="th-mobile-apply-filters" type="button" onClick={onApply}>
        Apply filters
      </button>
    </div>
  );
}


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
