"use client";

import { JobResultsState } from "../authenticated/job-results-state";
import { JobList } from "../shared/job-list";
import type { RefObject } from "react";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import type { Job } from "../job-discovery-utils";
import { PublicJobCardActions } from "./public-job-card-actions";
import { PublicJobSortSelect } from "./public-job-sort-select";

type ResultsData = Omit<JobDiscoveryWorkspaceProps, "loadMoreRef">;

function postedAge(data: ResultsData, id: string) {
  const job = data.jobs.find((item) => item.id === id) ?? null;
  const timestamp = job?.published_at ? Date.parse(job.published_at) : NaN;
  if (!Number.isFinite(timestamp)) return { label: "Date unknown", days: null };
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  return {
    label: days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`,
    days,
  };
}

export function PublicJobResultsPanel({
  data,
  loadMoreRef,
  onSelect,
}: {
  data: ResultsData;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  onSelect: (job: Job) => void;
}) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="th-job-results-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <header className="flex min-h-10 items-center justify-between gap-2 pb-2 text-detail text-public-muted">
          <span
            aria-live="polite"
            className="inline-flex w-fit flex-none items-center rounded-lg border border-accent/40 bg-accent-bg px-3 py-2 text-control font-bold text-accent-text shadow-sm max-[700px]:px-2.5 max-[700px]:py-1.5"
          >
            {data.resultCount} opportunities
          </span>
          <PublicJobSortSelect
            value={data.sortOrder}
            onChange={data.onSortOrderChange}
          />
        </header>
        <JobResultsState
          loading={data.loading}
          hasFeed={Boolean(data.feed)}
          error={data.error}
          hasJobs={data.jobs.length > 0}
          hasFilters={data.hasFilters}
          onRetry={data.onRetryFeed}
        />
        {data.jobs.length > 0 && (
          <JobList
            jobs={data.jobs}
            variant="public"
            postedAgeDays={(job) => postedAge(data, job.id).days}
            postedLabel={(job) => postedAge(data, job.id).label}
            onSelect={(job) =>
              onSelect(data.jobs.find((item) => item.id === job.id)!)
            }
            saveAction={(job) => (
              <PublicJobCardActions
                job={data.jobs.find((item) => item.id === job.id)!}
                configured={data.configured}
                onSave={data.onSaveJob}
                onDismiss={data.onDismissJob}
              />
            )}
          />
        )}
        {data.feed && data.feed.page < data.feed.totalPages && (
          <div
            ref={loadMoreRef}
            aria-live="polite"
            className="py-4 text-center text-detail text-fg-muted"
          >
            {data.loading
              ? "Loading more opportunities…"
              : "Scroll to load more opportunities"}
          </div>
        )}
      </div>
    </section>
  );
}
