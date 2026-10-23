import { Button } from "@/components/ui/button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { JobDetailActions } from "./job-detail-actions";
import { JobDetailStatus } from "./job-detail-status";
import {
  JobDetailPresentation,
  JobDetailEmptyState,
} from "../shared/job-detail-presentation";
import type { JobDetailContentProps } from "./job-detail-types";

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
      headingAction={
        <Stack
          className="th-jobs-match-scorebox"
          spacing={0.5}
          sx={{ alignItems: "flex-start" }}
        >
          <Typography variant="caption">Match</Typography>
          <Typography component="strong" sx={{ fontWeight: 700 }}>
            Not calculated
          </Typography>
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0"
            onClick={(event) => onViewMatch(event.currentTarget)}
          >
            Why is this unavailable?
          </Button>
        </Stack>
      }
      actions={
        <Stack spacing={1}>
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
        </Stack>
      }
    />
  );
}
