"use client";

import type { FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDiscoveryCategoryControls } from "./job-discovery-category-controls";
import { JobLocationSelect } from "./job-location-select";
import { JobSearchBar } from "./job-search-bar";

export type JobSearchSuggestion = {
  title: string;
  employer_name?: string | null;
};

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  jobs: JobSearchSuggestion[];
  selectedType: string;
  total: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onTypeChange: (key: string, label: string) => void;
  onOpenFilters: (anchorEl: HTMLElement) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function JobDiscoverySearchFilters(props: Props) {
  const suggestions = props.jobs.flatMap((job) => [
    job.title,
    job.employer_name ?? "",
  ]);
  return (
    <header className="w-full">
      <div className="flex w-full flex-col gap-3 lg:flex-row">
        <div className="min-w-0 flex-1">
          <JobSearchBar
            value={props.query}
            onChange={props.onQueryChange}
            onSubmit={props.onSubmit}
            placeholder="Job title, skills or company..."
            suggestions={suggestions}
          />
        </div>
        <div className="flex min-w-0 gap-3 lg:w-[min(42%,520px)]">
          <JobLocationSelect
            value={props.location}
            onChange={props.onLocationChange}
          />
          <Button
            variant="primary"
            className="h-11 shrink-0 gap-2 px-5"
            aria-label="Open filters"
            onClick={(event) => props.onOpenFilters(event.currentTarget)}
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>Filters</span>
          </Button>
        </div>
      </div>
      <JobDiscoveryCategoryControls
        selectedType={props.selectedType}
        total={props.total}
        sortOrder={props.sortOrder}
        onTypeChange={props.onTypeChange}
        onSortChange={props.onSortChange}
      />
    </header>
  );
}
