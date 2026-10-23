"use client";

import { JobDiscoverySearchFilters } from "../shared/job-discovery-search-filters";
import type { Filters } from "../job-discovery-utils";
import type { FormEvent } from "react";

export function JobDiscoveryHeader({
  draft,
  onQueryChange,
  onSubmit,
  onToggleFilters,
}: {
  draft: Filters;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
}) {
  return (
    <div className="w-full">
      <JobDiscoverySearchFilters
        query={draft.query}
        onQueryChange={onQueryChange}
        onOpenFilters={onToggleFilters}
        onSubmit={onSubmit}
      />
    </div>
  );
}
