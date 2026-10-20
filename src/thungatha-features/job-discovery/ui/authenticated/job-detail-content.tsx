import { ArrowLeft } from "lucide-react";
import Button from "@mui/material/Button";
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
  onBack,
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
      beforeContent={
        <Button
          variant="text"
          size="small"
          className="th-jobs-mobile-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back to results
        </Button>
      }
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
          <Button variant="text" size="small" onClick={(event) => onViewMatch(event.currentTarget)}>
            Why is this unavailable?
          </Button>
        </Stack>
      }
      actions={
        <Stack spacing={1}>
          <JobDetailActions
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
