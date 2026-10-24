"use client";

import type { FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobSearchBar } from "./job-search-bar";
import { JobDiscoveryCategoryControls } from "./job-discovery-category-controls";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onOpenFilters: (anchorEl: HTMLElement) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  categories: { key: string; label: string; count: number | null }[];
  category: string;
  onCategoryChange: (key: string, label: string) => void;
  resultCount: number;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  isAuthenticated: boolean;
};

export function JobDiscoverySearchFilters(props: Props) {
  return (
    <header className="mx-auto mb-4 w-full max-w-5xl max-[900px]:mx-0 max-[900px]:mb-3 max-[900px]:max-w-none max-[700px]:mt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-row items-center gap-2 max-[900px]:max-w-none">
        <div className="min-w-0 flex-1">
          <JobSearchBar value={props.query} onChange={props.onQueryChange} onSubmit={props.onSubmit} placeholder="Job title, skill, or company" />
        </div>
        <div className="flex shrink-0">
          <Button variant="primary" className="h-11 shrink-0 gap-2 border-0 bg-[var(--th-btn)] px-3 text-[var(--th-btn-fg)] hover:brightness-110 sm:px-4" aria-label="Open filters" onClick={(event) => props.onOpenFilters(event.currentTarget)}>
            <SlidersHorizontal size={18} aria-hidden="true" /><span>Filters</span>
          </Button>
        </div>
      </div>
      <div className="mt-3 min-w-0 max-[700px]:hidden">
        <JobDiscoveryCategoryControls selectedType={props.category} total={props.resultCount} onTypeChange={props.onCategoryChange} />
      </div>
    </header>
  );
}
