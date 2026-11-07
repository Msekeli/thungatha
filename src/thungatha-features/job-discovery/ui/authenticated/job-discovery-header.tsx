"use client";

import { JobDiscoverySearchFilters } from "../shared/job-discovery-search-filters";
import type { Filters } from "../job-discovery-utils";
import type { FormEvent } from "react";

export function JobDiscoveryHeader({
  prominent = false,
  draft,
  onQueryChange,
  onSubmit,
  onToggleFilters,
  category,
  onCategoryChange,
  isAuthenticated,
}: {
  prominent?: boolean;
  draft: Filters;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
  category: string;
  onCategoryChange: (key: string, label: string) => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="w-full">
      <JobDiscoverySearchFilters
        prominent={prominent}
        query={draft.query}
        onQueryChange={onQueryChange}
        onOpenFilters={onToggleFilters}
        onSubmit={onSubmit}
        category={category}
        onCategoryChange={onCategoryChange}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
