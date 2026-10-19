"use client";

import { JobCard, type JobCardData } from "./job-card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type JobListProps = {
  jobs: JobCardData[];
  selectedId?: string | null;
  postedLabel?: (job: JobCardData) => string | undefined;
  onSelect: (job: JobCardData) => void;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function JobList({
  jobs, selectedId, postedLabel, onSelect,
  emptyTitle = "No opportunities found",
  emptyMessage = "Try changing your search or filters.",
}: JobListProps) {
  if (!jobs.length) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <Typography fontWeight={600}>{emptyTitle}</Typography>
        <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
      </div>
    );
  }
  return (
    <Stack spacing={1}>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          selected={job.id === selectedId}
          postedLabel={postedLabel?.(job)}
          onSelect={() => onSelect(job)}
        />
      ))}
    </Stack>
  );
}
