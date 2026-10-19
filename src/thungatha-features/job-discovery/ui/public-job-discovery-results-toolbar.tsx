"use client";

import { BriefcaseBusiness, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobSearchBar } from "./shared/job-search-bar";

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
};

export function PublicJobDiscoveryResultsToolbar(props: Props) {
  const { loading, resultCount, total, hasActiveFilters, onClearFilters, sort,
    onSortChange, query, onQueryChange, jobs, onOpenFilters } = props;
  const resultLabel = loading ? "Loading opportunities…" : resultCount === 0
    ? "0 opportunities"
    : "1–" + Math.min(resultCount, 10) + " of " + total.toLocaleString() + " opportunities";
  const suggestions = jobs.flatMap((job) => [job.title, job.employer_name ?? ""]);

  return (
    <>
      <div className="th-results-toolbar">
        <span>{resultLabel}</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" type="button" className="th-clear-active-filters" onClick={onClearFilters}>
            <X size={13} /> Clear filters
          </Button>
        )}
        <label>Sort by
          <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
            <option value="relevant">Most relevant</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>
      <div className="th-mobile-search">
        <JobSearchBar value={query} onChange={onQueryChange}
          placeholder="Search jobs, skills or companies..." suggestions={suggestions} />
        <Button variant="ghost" size="sm" type="button" aria-label="Open filters" onClick={onOpenFilters}>
          <SlidersHorizontal size={17} />
        </Button>
      </div>
    </>
  );
}
