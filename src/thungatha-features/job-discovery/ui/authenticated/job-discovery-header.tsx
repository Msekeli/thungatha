"use client";

import Box from "@mui/material/Box";
import { JobDiscoveryBar } from "../shared/job-discovery-bar";
import type { Filters } from "../job-discovery-utils";
import type { FormEvent } from "react";

type Category = { key: string; label: string; count: number | null };
type JobItem = { title: string; employer_name?: string | null };

export function JobDiscoveryHeader({
  draft,
  categories,
  category,
  jobs,
  onQueryChange,
  onLocationChange,
  onSubmit,
  onToggleFilters,
  onCategoryChange,
}: {
  draft: Filters;
  categories: Category[];
  category: string;
  jobs?: JobItem[];
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
    <Box component="header" sx={{ width: "100%" }}>
      <JobDiscoveryBar
        query={draft.query}
        onQueryChange={onQueryChange}
        location={draft.location}
        onLocationChange={onLocationChange}
        jobs={jobs ?? []}
        selectedType={selectedType}
        total={allCount}
        onTypeChange={onCategoryChange}
        onOpenFilters={onToggleFilters}
        onSubmit={onSubmit}
      />
    </Box>
  );
}
