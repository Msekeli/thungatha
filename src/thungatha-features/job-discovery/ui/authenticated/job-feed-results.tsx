"use client";

import { JobList } from "../shared/job-list";
import type { JobCardData } from "../shared/job-card";
import { JobEmptyState } from "../shared/job-empty-state";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  jobs: JobCardData[];
  selectedId?: string | null;
  onSelect: (job: JobCardData) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
};

export function JobFeedResults({
  jobs, selectedId, onSelect, loading, error, onRetry, onClearFilters,
}: Props) {
  if (error) {
    return <JobEmptyState title="We couldn't load opportunities" message={error} actionLabel="Retry" onAction={onRetry} />;
  }
  if (!loading && !jobs.length) {
    return <JobEmptyState title="No matching opportunities" message="Try changing your search or filters." actionLabel="Clear filters" onAction={onClearFilters} />;
  }
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {loading ? "Loading opportunities…" : `${jobs.length} opportunities`}
      </Typography>
      <JobList jobs={jobs} selectedId={selectedId} onSelect={onSelect} />
    </Stack>
  );
}
