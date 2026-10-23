"use client";
import { JobResultsHeading } from "./job-results-heading";
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
  sortOrder,
  onSortChange,
}: JobResultsPanelProps) {
  return (
    <section
      className={`th-jobs-results-panel th-jobs-redesign-results flex h-full min-h-0 min-w-0 max-h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-sm max-[760px]:max-h-[58dvh] max-[760px]:rounded-xl max-[760px]:p-3 max-[760px]:shadow-none ${mobileDetail ? "th-jobs-mobile-hidden" : ""}`}
      aria-label="Job search results"
      aria-busy={loading}
    >
      <div className="z-30 -mx-4 -mt-4 mb-3 shrink-0 border-b border-line px-4 pb-3 pt-4 max-[760px]:-mx-3 max-[760px]:-mt-3 max-[760px]:mb-3 max-[760px]:px-3 max-[760px]:pt-3" style={{ backgroundColor: "var(--th-panel)", backgroundImage: "none" }}>
        <JobResultsHeading
          loading={loading}
          count={jobs.length}
          total={feed?.total ?? jobs.length}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </div>
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
