"use client";

import { JobDiscoverySearchFilters } from "../shared/job-discovery-search-filters";
import type { Filters } from "../job-discovery-utils";
import type { FormEvent } from "react";

type Category = { key: string; label: string; count: number | null };

export function JobDiscoveryHeader({
  draft,
  categories,
  category,
  onQueryChange,
  onLocationChange,
  onSubmit,
  onToggleFilters,
  onCategoryChange,
}: {
  draft: Filters;
  categories: Category[];
  category: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
  onCategoryChange: (key: string, label: string) => void;
}) {
  const allCount = categories.find((item) => item.key === "all")?.count ?? 0;
  const selectedType =
    draft.employmentType || (category === "new" ? "all" : category);

  return (
    <div className="w-full">
      <JobDiscoverySearchFilters
        query={draft.query}
        onQueryChange={onQueryChange}
        location={draft.location}
        onLocationChange={onLocationChange}
        selectedType={selectedType}
        total={allCount}
        onTypeChange={onCategoryChange}
        onOpenFilters={onToggleFilters}
        onSubmit={onSubmit}
      />
    </div>
  );
}
