"use client";
import { ChevronDown } from "lucide-react";
import { JobResultsState } from "./job-results-state";
import { JobResultsList } from "./job-results-list";
import type { JobResultsPanelProps } from "./job-results-types";

export function AuthenticatedJobResultsPanel({
  jobs, feed, loading, error, hasFilters, mobileDetail, selectedId,
  loadMoreRef, sourceFor, formatDate, onRetry, onSelect, onSave, onDismiss,
  configured, resultCount, category, dismissedCount, isAuthenticated,
  sortOrder, onSortOrderChange, onCategoryChange,
}: JobResultsPanelProps) {
  return (
    <section
      className={`th-jobs-results-panel th-jobs-redesign-results flex h-full min-h-0 min-w-0 max-h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-sm max-[900px]:max-h-[68dvh] max-[900px]:rounded-xl max-[900px]:p-3 max-[900px]:shadow-none max-[900px]:order-1 max-[700px]:h-full max-[700px]:max-h-none max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:bg-transparent max-[700px]:p-0 ${mobileDetail ? "max-[900px]:hidden" : ""}`}
      aria-label="Job search results"
      aria-busy={loading}
    >
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--th-line)] pb-3">
        <div className="flex items-center gap-3 text-sm text-[var(--th-fg-muted)]">
          <span aria-live="polite">{resultCount > 0 ? `1–${Math.min(30, resultCount)} of ${resultCount} opportunities` : "0 opportunities"}</span>
          {isAuthenticated && (
            <button type="button" onClick={() => onCategoryChange("dismissed", "Dismissed")} className={category === "dismissed" ? "font-semibold text-[var(--th-accent)] underline underline-offset-4" : "text-[var(--th-accent)] hover:underline"} aria-pressed={category === "dismissed"}>
              Dismissed ({dismissedCount})
            </button>
          )}
        </div>
        <label className="relative flex items-center">
          <span className="sr-only">Sort opportunities</span>
          <select
            aria-label="Sort opportunities"
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value)}
            className="h-11 min-w-[14rem] appearance-none rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] py-2 pl-4 pr-11 text-base text-[var(--th-fg)] outline-none transition-colors focus:border-[var(--th-accent)] focus:ring-2 focus:ring-[var(--th-accent)]/20"
          >
            <option value="relevance">Most relevant</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="salary-high">Salary: high to low</option>
            <option value="salary-low">Salary: low to high</option>
          </select>
          <ChevronDown size={18} aria-hidden="true" className="pointer-events-none absolute right-4 text-[var(--th-fg-muted)]" />
        </label>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <JobResultsState loading={loading} hasFeed={Boolean(feed)} error={error} hasJobs={jobs.length > 0} hasFilters={hasFilters} onRetry={onRetry} />
        {jobs.length > 0 && <JobResultsList jobs={jobs} selectedId={selectedId} loading={loading} feed={feed} loadMoreRef={loadMoreRef} sourceFor={sourceFor} formatDate={formatDate} onSelect={onSelect} onSave={onSave} onDismiss={onDismiss} configured={configured} />}
      </div>
    </section>
  );
}
