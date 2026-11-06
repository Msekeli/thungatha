"use client";

import { JobList } from "../shared/job-list";
import { JobResultsState } from "../authenticated/job-results-state";
import { PublicJobCardActions } from "./public-job-card-actions";
import { PublicJobSortSelect } from "./public-job-sort-select";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import type { Job } from "../job-discovery-utils";

export function PublicJobResultsPanel({
  data,
  onSelect,
}: {
  data: JobDiscoveryWorkspaceProps;
  onSelect: (job: Job) => void;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 text-control text-fg-muted">
        <span aria-live="polite" className="font-medium">{data.resultCount} opportunities</span>
        <PublicJobSortSelect value={data.sortOrder} onChange={data.onSortOrderChange} />
      </header>
      <JobResultsState loading={data.loading} hasFeed={Boolean(data.feed)} error={data.error} hasJobs={data.jobs.length > 0} hasFilters={data.hasFilters} onRetry={data.onRetryFeed} />
      {data.jobs.length > 0 && (
        <JobList
          jobs={data.jobs}
          variant="public"
          postedLabel={(job) => {
            const fullJob = data.jobs.find((item) => item.id === job.id)!;
            const published = data.sourceFor(fullJob)?.published_at;
            return published ? data.formatDate(published) ?? "Date unknown" : "Date unknown";
          }}
          onSelect={(job) => onSelect(data.jobs.find((item) => item.id === job.id)!)}
          saveAction={(job) => <PublicJobCardActions job={data.jobs.find((item) => item.id === job.id)!} configured={data.configured} onSave={data.onSaveJob} onDismiss={data.onDismissJob} />}
        />
      )}
      {data.feed && data.feed.page < data.feed.totalPages && (
        <div ref={data.loadMoreRef} aria-live="polite" className="py-4 text-center text-detail text-fg-muted">
          {data.loading ? "Loading more opportunities…" : "Scroll to load more opportunities"}
        </div>
      )}
    </section>
  );
}
