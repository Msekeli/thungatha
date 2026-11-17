import type { RefObject } from "react";
import { JobList } from "../shared/job-list";
import type { Job } from "./job-results-types";
import { JobCardActions } from "../shared/job-card-actions";

export function JobResultsList({
  jobs,
  selectedId,
  loading,
  feed,
  loadMoreRef,
  formatDate,
  onSelect,
  onSave,
  onDismiss,
  configured,
}: {
  jobs: Job[];
  selectedId: string | null;
  loading: boolean;
  feed: { page: number; totalPages: number } | null;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  formatDate: (value: string | null | undefined) => string | null;
  onSelect: (job: Job) => void;
  onSave: (job: Job) => void;
  onDismiss: (job: Job) => void;
  configured: boolean;
}) {
  return (
    <>
      <JobList
        jobs={jobs}
        variant="authenticated"
        selectedId={selectedId}
        postedLabel={(job) =>
          formatDate((job as Job).published_at) ?? undefined
        }
        onSelect={(job) => onSelect(job as Job)}
        saveAction={(job) => {
          const fullJob = jobs.find((item) => item.id === job.id)!;
          return (
            <JobCardActions
              job={fullJob}
              configured={configured}
              onSave={onSave}
              onHide={onDismiss}
            />
          );
        }}
      />
      {feed && feed.page < feed.totalPages && (
        <div
          ref={loadMoreRef}
          aria-live="polite"
          className="px-2 py-4 text-center text-xs text-fg-muted"
        >
          {loading
            ? "Loading more opportunities…"
            : "Scroll to load more opportunities"}
        </div>
      )}
    </>
  );
}
