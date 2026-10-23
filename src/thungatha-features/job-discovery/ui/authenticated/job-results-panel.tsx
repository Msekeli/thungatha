"use client";
import { JobResultsState } from "./job-results-state";
import { JobResultsList } from "./job-results-list";
import type { JobResultsPanelProps } from "./job-results-types";

export function AuthenticatedJobResultsPanel({
  jobs,
  feed,
  loading,
  error,
  hasFilters,
  mobileDetail,
  selectedId,
  loadMoreRef,
  sourceFor,
  formatDate,
  onRetry,
  onSelect,
  onSave,
  onDismiss,
  configured,
}: JobResultsPanelProps) {
  return (
    <section
      className={`th-jobs-results-panel th-jobs-redesign-results flex h-full min-h-0 min-w-0 max-h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-sm max-[900px]:max-h-[68dvh] max-[900px]:rounded-xl max-[900px]:p-3 max-[900px]:shadow-none max-[900px]:order-1 max-[700px]:h-full max-[700px]:max-h-none max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:bg-transparent max-[700px]:p-0 ${mobileDetail ? "max-[900px]:hidden" : ""}`}
      aria-label="Job search results"
      aria-busy={loading}
    >
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <JobResultsState
          loading={loading}
          hasFeed={Boolean(feed)}
          error={error}
          hasJobs={jobs.length > 0}
          hasFilters={hasFilters}
          onRetry={onRetry}
        />
        {jobs.length > 0 && (
          <JobResultsList
            jobs={jobs}
            selectedId={selectedId}
            loading={loading}
            feed={feed}
            loadMoreRef={loadMoreRef}
            sourceFor={sourceFor}
            formatDate={formatDate}
            onSelect={onSelect}
            onSave={onSave}
            onDismiss={onDismiss}
            configured={configured}
          />
        )}
      </div>
    </section>
  );
}
