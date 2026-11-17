"use client";

import type { Job } from "../job-discovery-utils";
import { JobCardActions } from "../shared/job-card-actions";

export function PublicJobCardActions({
  job,
  configured,
  onSave,
  onDismiss,
}: {
  job: Job;
  configured: boolean;
  onSave: (job: Job) => void;
  onDismiss: (job: Job) => void;
}) {
  return (
    <JobCardActions
      job={job}
      configured={configured}
      onSave={onSave}
      onHide={onDismiss}
    />
  );
}
