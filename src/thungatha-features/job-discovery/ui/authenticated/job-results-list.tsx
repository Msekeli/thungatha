import type { RefObject } from "react";
import Box from "@mui/material/Box";
import { Bookmark, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobList } from "../shared/job-list";
import type { Job, JobSource } from "./job-results-types";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";

export function JobResultsList({
  jobs,
  selectedId,
  loading,
  feed,
  loadMoreRef,
  sourceFor,
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
  sourceFor: (job: Job | null) => JobSource | null;
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
          sourceFor(job as Job)?.published_at
            ? formatDate(sourceFor(job as Job)?.published_at) || "Date unknown"
            : "Date unknown"
        }
        onSelect={(job) => onSelect(job as Job)}
        saveAction={(job) => {
          const fullJob = jobs.find((item) => item.id === job.id)!;
          const saved = fullJob.state === "saved";
          const dismissed = fullJob.state === "dismissed";
          return (
            <>
              <ProtectedDiscoveryAction
                configured={configured}
                title="Save this opportunity"
                description="Sign in or create a free account to save this job and return to it later."
                onAction={() => onSave(fullJob)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  aria-label={saved ? `Unsave ${fullJob.title}` : `Save ${fullJob.title}`}
                  title={saved ? "Remove from saved jobs" : "Save job"}
                >
                  <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                </Button>
              </ProtectedDiscoveryAction>
              <ProtectedDiscoveryAction
                configured={configured}
                title="Dismiss this opportunity"
                description="Sign in or create a free account to dismiss jobs that are not right for you."
                onAction={() => onDismiss(fullJob)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  aria-label={dismissed ? `Restore ${fullJob.title}` : `Dismiss ${fullJob.title}`}
                  title={dismissed ? "Restore job" : "Not for me"}
                  className={dismissed ? "text-[var(--th-accent)]" : "text-[var(--th-fg-muted)] hover:text-destructive"}
                >
                  <ThumbsDown size={16} />
                </Button>
              </ProtectedDiscoveryAction>
            </>
          );
        }}
      />
      {feed && feed.page < feed.totalPages && (
        <Box
          ref={loadMoreRef}
          aria-live="polite"
          sx={{
            p: "16px 8px",
            textAlign: "center",
            color: "text.secondary",
            fontSize: 12,
          }}
        >
          {loading
            ? "Loading more opportunities…"
            : "Scroll to load more opportunities"}
        </Box>
      )}
    </>
  );
}
