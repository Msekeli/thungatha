"use client";

import { JobCard, type JobCardData } from "./job-card";
import { JobEmptyState } from "./job-empty-state";
import Stack from "@mui/material/Stack";

type JobListProps = {
  jobs: JobCardData[];
  variant: "public" | "authenticated";
  selectedId?: string | null;
  postedLabel?: (job: JobCardData) => string | undefined;
  onSelect: (job: JobCardData) => void;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function JobList({
  jobs, variant, selectedId, postedLabel, onSelect,
  emptyTitle = "No opportunities found",
  emptyMessage = "Try changing your search or filters.",
}: JobListProps) {
  if (!jobs.length) {
    return <JobEmptyState title={emptyTitle} message={emptyMessage} />;
  }
  return (
    <Stack spacing={1}>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          variant={variant}
          selected={job.id === selectedId}
          postedLabel={postedLabel?.(job) ?? "Date unknown"}
          onSelect={() => onSelect(job)}
        />
      ))}
    </Stack>
  );
}
