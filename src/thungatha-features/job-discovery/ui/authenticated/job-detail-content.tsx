import { Button } from "@/components/ui/button";
import { JobDetailActions } from "./job-detail-actions";
import { JobDetailStatus } from "./job-detail-status";
import {
  JobDetailPresentation,
  JobDetailEmptyState,
} from "../shared/job-detail-presentation";
import type { JobDetailContentProps } from "./job-detail-types";
import { JobDetailMatchSummary } from "./job-detail-match-summary";

export function AuthenticatedJobDetailContent({
  configured,
  job,
  source,
  applicationDestination,
  applicationUrl,
  jobSourceUrl,
  busy,
  detailLoading,
  activityError,
  detailError,
  formatDate,
  onViewMatch,
  onApply,
  onSave,
  onDismiss,
  onRetry,
}: JobDetailContentProps) {
  if (!job) return <JobDetailEmptyState />;
  return (
    <JobDetailPresentation
      job={job}
      postedAt={source?.published_at || null}
      formatDate={formatDate}
      headingAction={<JobDetailMatchSummary onViewMatch={onViewMatch} />}
      actions={
        <div className="flex flex-col gap-2">
          <JobDetailActions
            configured={configured}
            job={job}
            applicationDestination={applicationDestination}
            applicationUrl={applicationUrl}
            jobSourceUrl={jobSourceUrl}
            busy={busy}
            detailLoading={detailLoading}
            onApply={onApply}
            onSave={onSave}
            onDismiss={onDismiss}
          />
          <JobDetailStatus
            activityError={activityError}
            detailError={detailError}
            applicationUrl={applicationUrl}
            onRetry={onRetry}
          />
        </div>
      }
      afterDescription={
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start px-0 text-accent-text min-[601px]:hidden"
          onClick={(event) => onViewMatch(event.currentTarget)}
        >
          About job matching
        </Button>
      }
    />
  );
}
