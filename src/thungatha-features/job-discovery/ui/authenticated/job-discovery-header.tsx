"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { JobDiscoveryBar } from "../shared/job-discovery-bar";
import { jobTypeValueFromBarKey } from "../shared/job-discovery-bar";
import type { Filters } from "../job-discovery-utils";

type Category = { key: string; label: string; count: number | null };
type JobItem = { title: string; employer_name?: string | null };

export function JobDiscoveryHeader({
  draft,
  filtersOpen,
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
  filtersOpen: boolean;
  categories: Category[];
  category: string;
  jobs: JobItem[];
  sortOrder: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleFilters: (anchorEl: HTMLElement) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (key: string, label: string) => void;
}) {
  const allCount = categories.find((item) => item.key === "all")?.count ?? 0;
  const selectedType = draft.employmentType || (category === "new" ? "all" : category);

  return (
    <Box component="header" sx={{ px: { xs: 1.5, md: 2.5 }, pt: { xs: 1.25, md: 1.75 } }}>
      <Typography component="h1" variant="h5" sx={{ fontWeight: 750, mb: 1.25 }}>
        Job discovery
      </Typography>
      <JobDiscoveryBar
        query={draft.query}
        onQueryChange={onQueryChange}
        location={draft.location}
        onLocationChange={onLocationChange}
        jobs={jobs}
        selectedType={selectedType}
        total={allCount}
        onTypeChange={(key, label) => onCategoryChange(key, label)}
        onOpenFilters={onToggleFilters}
        onSubmit={() => {
          const form = document.querySelector<HTMLFormElement>('[role="search"]');
          form?.requestSubmit();
        }}
      />
    </Box>
  );
}
