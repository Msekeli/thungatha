"use client";

import { JobDiscoverySearchFilters } from "../shared/job-discovery-search-filters";
import type { Filters } from "../job-discovery-utils";
import type { FormEvent } from "react";

export function JobDiscoveryHeader({
  draft,
  onQueryChange,
  onSubmit,
  onToggleFilters,
  categories,
  category,
  onCategoryChange,
  resultCount,
  sortOrder,
  onSortOrderChange,
  isAuthenticated,
}: {
  draft: Filters;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
  categories: { key: string; label: string; count: number | null }[];
  category: string;
  onCategoryChange: (key: string, label: string) => void;
  resultCount: number;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="w-full">
      <JobDiscoverySearchFilters
        query={draft.query}
        onQueryChange={onQueryChange}
        onOpenFilters={onToggleFilters}
        onSubmit={onSubmit}
        categories={categories}
        category={category}
        onCategoryChange={onCategoryChange}
        resultCount={resultCount}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
