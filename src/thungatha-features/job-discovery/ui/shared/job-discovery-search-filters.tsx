"use client";

import type { FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDiscoveryCategoryControls } from "./job-discovery-category-controls";
import { JobLocationSelect } from "./job-location-select";
import { JobSearchBar } from "./job-search-bar";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  selectedType: string;
  total: number;
  onTypeChange: (key: string, label: string) => void;
  onOpenFilters: (anchorEl: HTMLElement) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function JobDiscoverySearchFilters(props: Props) {
  return (
    <header className="mx-auto mb-6 w-full max-w-5xl">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <JobSearchBar
            value={props.query}
            onChange={props.onQueryChange}
            onSubmit={props.onSubmit}
            placeholder="Job title, skill, or company"
          />
        </div>
        <div className="flex min-w-0 gap-3 md:w-[min(38%,400px)] md:flex-none">
          <JobLocationSelect
            value={props.location}
            onChange={props.onLocationChange}
          />
          <Button
            variant="primary"
            className="h-11 shrink-0 gap-2 border-0 bg-[var(--th-btn)] px-4 text-[var(--th-btn-fg)] hover:brightness-110"
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
        onTypeChange={props.onTypeChange}
      />
    </header>
  );
}
