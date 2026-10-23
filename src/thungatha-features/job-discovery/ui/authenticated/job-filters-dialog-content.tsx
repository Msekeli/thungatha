"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { JobLocationSelect } from "../shared/job-location-select";
import { EMPLOYMENT_TYPE_OPTIONS } from "../shared/job-filter-options";
import { JobFilterFields } from "../shared/job-filter-fields";
import type { JobFiltersDraft } from "./job-filters-dialog";

type Props = {
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
  return (
    EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === normalized)
      ?.value ?? normalized
  );
}

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
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close filters"
          onClick={onClose}
        >
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
      <JobFilterFields
        workMode={draft.workMode}
        onWorkModeChange={(value) => onChange("workMode", String(value))}
        employmentType={canonicalEmploymentType(draft.employmentType)}
        onEmploymentTypeChange={(value) =>
          onChange("employmentType", value === "all" ? "" : value)
        }
        publishedWithin={draft.publishedWithin}
        onPublishedWithinChange={(value) => onChange("publishedWithin", value)}
      />
      <footer className="mt-3 flex justify-between gap-2 border-t border-line pt-3">
        <Button type="button" variant="secondary" onClick={onReset}>
          Reset
        </Button>
        <Button type="button" variant="primary" onClick={onApply}>
          Apply filters
        </Button>
      </footer>
    </>
  );
}
