"use client";

import { JobOpportunityCard, type JobCardData } from "./job-opportunity-card";
import { JobEmptyState } from "./job-empty-state";
import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";

type JobListProps = {
  jobs: JobCardData[];
  variant: "public" | "authenticated";
  selectedId?: string | null;
  postedLabel?: (job: JobCardData) => string | undefined;
  onSelect: (job: JobCardData) => void;
  saveAction?: (job: JobCardData) => ReactNode;
  secondaryAction?: (job: JobCardData) => ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function JobList({
  jobs,
  variant,
  selectedId,
  postedLabel,
  onSelect,
  emptyTitle = "No opportunities found",
  emptyMessage = "Try changing your search or filters.",
  saveAction,
  secondaryAction,
}: JobListProps) {
  if (!jobs.length) {
    return <JobEmptyState title={emptyTitle} message={emptyMessage} />;
  }
  return (
    <Stack spacing={1}>
      {jobs.map((job) => (
        <JobOpportunityCard
          key={job.id}
          job={job}
          variant={variant}
          selected={job.id === selectedId}
          postedLabel={postedLabel?.(job) ?? "Date unknown"}
          onSelect={() => onSelect(job)}
          saveAction={
            saveAction || secondaryAction ? (
              <>
                {saveAction?.(job)}
                {secondaryAction?.(job)}
              </>
            ) : undefined
          }
        />
      ))}
    </Stack>
  );
}
