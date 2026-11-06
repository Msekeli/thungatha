"use client";

import { Select } from "@base-ui/react/select";
import { ArrowDownWideNarrow, Check, ChevronDown, Bookmark, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobList } from "../shared/job-list";
import { JobResultsState } from "../authenticated/job-results-state";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";
import type { JobDiscoveryWorkspaceProps } from "../shared/job-discovery-workspace-types";
import type { Job } from "../job-discovery-utils";

const sortOptions = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function PublicJobResultsPanel({
  data,
  onSelect,
}: {
  data: JobDiscoveryWorkspaceProps;
  onSelect: (job: Job) => void;
}) {
  const selectedLabel = sortOptions.find((item) => item.value === data.sortOrder)?.label ?? "Newest first";
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 text-sm text-fg-muted">
        <span aria-live="polite" className="font-medium">
          {data.resultCount} opportunities
        </span>
        <div className="flex items-center gap-2 text-fg">
          <ArrowDownWideNarrow size={16} className="text-fg-muted" aria-hidden="true" />
          <Select.Root value={data.sortOrder} onValueChange={data.onSortOrderChange}>
            <Select.Trigger aria-label={`Sort opportunities: ${selectedLabel}`} className="inline-flex h-10 items-center gap-2 rounded-control px-2 text-sm font-medium outline-none hover:bg-panel-2 focus-visible:ring-2 focus-visible:ring-accent/40">
              <Select.Value>{selectedLabel}</Select.Value>
              <Select.Icon><ChevronDown size={16} /></Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner className="z-50 outline-none" sideOffset={6} align="end">
                <Select.Popup className="min-w-48 rounded-panel border border-line bg-panel p-1 text-sm text-fg shadow-lg">
                  <Select.List>
                    {sortOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value} className="flex cursor-default items-center justify-between gap-4 rounded-control px-3 py-2 outline-none data-[highlighted]:bg-panel-2">
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator><Check size={14} /></Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </header>
      <JobResultsState loading={data.loading} hasFeed={Boolean(data.feed)} error={data.error} hasJobs={data.jobs.length > 0} hasFilters={data.hasFilters} onRetry={data.onRetryFeed} />
      <JobList
        jobs={data.jobs}
        variant="public"
        postedLabel={(job) => data.sourceFor(data.jobs.find((item) => item.id === job.id) ?? null)?.published_at ? data.formatDate(data.sourceFor(data.jobs.find((item) => item.id === job.id) ?? null)?.published_at) ?? "Date unknown" : "Date unknown"}
        onSelect={(job) => onSelect(data.jobs.find((item) => item.id === job.id)!)}
        saveAction={(job) => {
          const fullJob = data.jobs.find((item) => item.id === job.id)!;
          const saved = fullJob.state === "saved";
          return (
            <ProtectedDiscoveryAction configured={data.configured} title="Save this opportunity" description="Sign in or create a free account to save this job and return to it later." onAction={() => data.onSaveJob(fullJob)}>
              <Button variant="ghost" size="icon" aria-label={saved ? `Unsave ${fullJob.title}` : `Save ${fullJob.title}`} title={saved ? "Remove saved job" : "Save job"}>
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
              </Button>
            </ProtectedDiscoveryAction>
          );
        }}
        secondaryAction={(job) => {
          const fullJob = data.jobs.find((item) => item.id === job.id)!;
          const dismissed = fullJob.state === "dismissed";
          return (
            <ProtectedDiscoveryAction configured={data.configured} title="Dismiss this opportunity" description="Sign in or create a free account to dismiss jobs that are not right for you." onAction={() => data.onDismissJob(fullJob)}>
              <Button variant="ghost" size="icon" aria-label={dismissed ? `Restore ${fullJob.title}` : `Dismiss ${fullJob.title}`} title={dismissed ? "Restore job" : "Not for me"} className="text-fg-muted hover:text-danger">
                <ThumbsDown size={18} />
              </Button>
            </ProtectedDiscoveryAction>
          );
        }}
      />
      {data.feed && data.feed.page < data.feed.totalPages && (
        <div ref={data.loadMoreRef} aria-live="polite" className="py-4 text-center text-xs text-fg-muted">
          {data.loading ? "Loading more opportunities…" : "Scroll to load more opportunities"}
        </div>
      )}
    </section>
  );
}
