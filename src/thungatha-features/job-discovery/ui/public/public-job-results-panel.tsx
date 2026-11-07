"use client";

import { Button } from "@/components/ui/button";
import { JobResultsState } from "../authenticated/job-results-state";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";
import { JobList } from "../shared/job-list";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import type { Job } from "../job-discovery-utils";
import { PublicJobCardActions } from "./public-job-card-actions";
import { PublicJobSortSelect } from "./public-job-sort-select";

function postedAge(data: JobDiscoveryWorkspaceProps, id: string) {
  const job = data.jobs.find((item) => item.id === id) ?? null;
  const published = data.sourceFor(job)?.published_at;
  const timestamp = published ? Date.parse(published) : NaN;
  if (!Number.isFinite(timestamp)) return { label: "Date unknown", days: null };
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  const label = days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
  return { label, days };
}

export function PublicJobResultsPanel({
  data,
  onSelect,
}: {
  data: JobDiscoveryWorkspaceProps;
  onSelect: (job: Job) => void;
}) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
      <header className="flex min-h-8 shrink-0 items-center justify-between gap-3 text-detail text-public-muted">
        <div className="flex min-w-0 items-center gap-2"><span aria-live="polite" className="inline-flex shrink-0 items-center rounded-lg border border-accent/40 bg-accent-bg px-3 py-1 text-control font-bold text-accent-text shadow-sm">{data.resultCount} opportunities</span>
        <div className="flex items-center gap-2">
          <ProtectedDiscoveryAction configured={data.configured} title="View dismissed opportunities" description="Sign in or create a free account to review jobs you have dismissed." onAction={() => data.onCategoryChange("dismissed", "Dismissed")}>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-detail text-accent-text">Dismissed ({data.dismissedCount})</Button>
          </ProtectedDiscoveryAction>
          <PublicJobSortSelect value={data.sortOrder} onChange={data.onSortOrderChange} />
        </div>
      </header>
      <JobResultsState loading={data.loading} hasFeed={Boolean(data.feed)} error={data.error} hasJobs={data.jobs.length > 0} hasFilters={data.hasFilters} onRetry={data.onRetryFeed} />
      {data.jobs.length > 0 && (
        <JobList
          jobs={data.jobs}
          variant="public"
          postedAgeDays={(job) => postedAge(data, job.id).days}
          postedLabel={(job) => postedAge(data, job.id).label}
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
