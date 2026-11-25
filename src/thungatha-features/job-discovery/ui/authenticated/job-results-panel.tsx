"use client";

import { JobResultsState } from "./job-results-state";
import { JobResultsList } from "./job-results-list";
import { JobResultsSortControl } from "./job-results-sort-control";
import type { JobResultsPanelProps } from "./job-results-types";

export function AuthenticatedJobResultsPanel({
  jobs, feed, loading, error, hasFilters, mobileDetail, selectedId,
  loadMoreRef, formatDate, onRetry, onSelect, onSave, onDismiss,
  configured, resultCount, sortOrder, onSortOrderChange,
}: JobResultsPanelProps) {
  return (
    <section
      className={`th-jobs-results-panel th-jobs-redesign-results flex h-full min-h-0 min-w-0 max-h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-sm max-[900px]:max-h-[68dvh] max-[900px]:rounded-xl max-[900px]:p-3 max-[900px]:shadow-none max-[900px]:order-1 max-[700px]:h-full max-[700px]:max-h-none max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:bg-transparent max-[700px]:p-0 ${mobileDetail ? "max-[900px]:hidden" : ""}`}
      aria-label="Job search results"
      aria-busy={loading}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-[var(--th-line)] pb-3 max-[700px]:mb-2 max-[700px]:pb-2">
        <div className="min-w-0 text-sm text-[var(--th-fg-muted)]">
          <span aria-live="polite" className="whitespace-nowrap">
            {resultCount > 0 ? `1–${Math.min(30, resultCount)} of ${resultCount} opportunities` : "0 opportunities"}
          </span>
        </div>
        <JobResultsSortControl value={sortOrder} onChange={onSortOrderChange} />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <JobResultsState loading={loading} hasFeed={Boolean(feed)} error={error} hasJobs={jobs.length > 0} hasFilters={hasFilters} onRetry={onRetry} />
        {jobs.length > 0 && (
          <JobResultsList
            jobs={jobs} selectedId={selectedId} loading={loading} feed={feed}
            loadMoreRef={loadMoreRef} formatDate={formatDate} onSelect={onSelect}
            onSave={onSave} onDismiss={onDismiss} configured={configured}
          />
        )}
      </div>
    </section>
  );
}
