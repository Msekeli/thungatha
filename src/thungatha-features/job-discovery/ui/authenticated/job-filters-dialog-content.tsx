"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { JobLocationSelect } from "../shared/job-location-select";
import { PUBLISHED_WITHIN_OPTIONS } from "../shared/job-filter-options";
import type { JobFiltersDraft } from "./job-filters-dialog";

type Props = {
  draft: JobFiltersDraft;
  onClose: () => void;
  onChange: (key: keyof JobFiltersDraft, value: string) => void;
  onReset: () => void;
  onApply: () => void;
};

export function JobFiltersDialogContent({
  draft,
  onClose,
  onChange,
  onReset,
  onApply,
}: Props) {
  return (
    <>
      <header className="mb-3 flex items-center justify-between gap-2 border-b border-line pb-3">
        <strong>Filter opportunities</strong>
        <Button variant="ghost" size="sm" aria-label="Close filters" onClick={onClose}>
          <X size={16} />
        </Button>
      </header>
      <div className="mb-3">
        <p className="mb-1 text-sm font-medium">Location</p>
        <JobLocationSelect
          value={draft.location}
          onChange={(value) => onChange("location", value)}
          ariaLabel="Filter by location"
        />
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Published within
        <select
          value={draft.publishedWithin}
          onChange={(event) => onChange("publishedWithin", event.target.value)}
          className="min-h-10 rounded-lg border border-line bg-panel px-3 text-sm text-fg"
        >
          {PUBLISHED_WITHIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <footer className="mt-3 flex justify-between gap-2 border-t border-line pt-3">
        <Button type="button" variant="secondary" onClick={onReset}>Reset</Button>
        <Button type="button" variant="primary" onClick={onApply}>Apply filters</Button>
      </footer>
    </>
  );
}
