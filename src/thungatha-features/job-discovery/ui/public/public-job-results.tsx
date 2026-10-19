"use client";

import { JobList } from "../shared/job-list";
import type { JobCardData } from "../shared/job-card";
import { JobEmptyState } from "../shared/job-empty-state";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  jobs: JobCardData[];
  onSelect: (job: JobCardData) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function PublicJobResults({ jobs, onSelect, loading, error, onRetry }: Props) {
  if (error) {
    return <JobEmptyState title="Jobs couldn't load" message={error} actionLabel="Retry" onAction={onRetry} />;
  }
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {loading ? "Finding opportunities…" : `${jobs.length} opportunities`}
      </Typography>
      <JobList jobs={jobs} onSelect={onSelect} />
    </Stack>
  );
}
