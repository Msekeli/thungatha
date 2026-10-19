"use client";

import { Box, Button, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { SlidersHorizontal, X } from "lucide-react";
import { JobSearchBar } from "../shared/job-search-bar";

type JobSuggestion = { title: string; employer_name: string | null };
type Props = {
  loading: boolean;
  resultCount: number;
  total: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  sort: string;
  onSortChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  jobs: JobSuggestion[];
  onOpenFilters: () => void;
  dismissedCount?: number;
  showingDismissed?: boolean;
  onToggleDismissed?: () => void;
};

export function PublicJobDiscoveryResultsToolbar(props: Props) {
  const { loading, resultCount, total, hasActiveFilters, onClearFilters, sort,
    onSortChange, query, onQueryChange, jobs, onOpenFilters, dismissedCount = 0, showingDismissed = false, onToggleDismissed } = props;
  const resultLabel = loading ? "Loading opportunities…" : resultCount === 0
    ? "0 opportunities"
    : "1–" + Math.min(resultCount, total) + " of " + total.toLocaleString() + " opportunities";
  const suggestions = jobs.flatMap((job) => [job.title, job.employer_name ?? ""]);

  return (
    <>
      <Stack className="th-results-toolbar" direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ mr: "auto" }}>{resultLabel}</Typography>
        {onToggleDismissed && <Button variant={showingDismissed ? "contained" : "text"} size="small" onClick={onToggleDismissed}>{showingDismissed ? "Back to opportunities" : `Dismissed (${dismissedCount})`}</Button>}
        {hasActiveFilters && <Button variant="text" size="small" onClick={onClearFilters} startIcon={<X size={14} />}>Clear filters</Button>}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select aria-label="Sort jobs" value={sort} onChange={(event) => onSortChange(event.target.value)}>
            <MenuItem value="relevant">Most relevant</MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack className="th-mobile-search" direction="row" spacing={1} alignItems="center">
        <BoxSearch query={query} onQueryChange={onQueryChange} suggestions={suggestions} />
        <Button variant="outlined" size="small" aria-label="Open filters" onClick={onOpenFilters} sx={{ minWidth: 40, px: 1 }}>
          <SlidersHorizontal size={17} />
        </Button>
      </Stack>
    </>
  );
}

function BoxSearch({ query, onQueryChange, suggestions }: { query: string; onQueryChange: (value: string) => void; suggestions: string[] }) {
  return <Box sx={{ flex: 1, minWidth: 0 }}>
    <JobSearchBar value={query} onChange={onQueryChange}
      placeholder="Search jobs, skills or companies..." suggestions={suggestions} />
  </div>;
}
