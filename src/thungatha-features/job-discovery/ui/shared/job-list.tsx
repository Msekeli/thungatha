"use client";

import type { ReactNode } from "react";
import { PublicJobOpportunityCard } from "../public/public-job-opportunity-card";
import { JobOpportunityCard, type JobCardData } from "./job-opportunity-card";
import { JobEmptyState } from "./job-empty-state";

type JobListProps = {
  jobs: JobCardData[];
  variant: "public" | "authenticated";
  selectedId?: string | null;
  postedLabel?: (job: JobCardData) => string | undefined;
  postedAgeDays?: (job: JobCardData) => number | null;
  onSelect: (job: JobCardData) => void;
  saveAction?: (job: JobCardData) => ReactNode;
  secondaryAction?: (job: JobCardData) => ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function JobList({
  jobs, variant, selectedId, postedLabel, postedAgeDays, onSelect,
  emptyTitle = "No opportunities found",
  emptyMessage = "Try changing your search or filters.",
  saveAction, secondaryAction,
}: JobListProps) {
  if (!jobs.length) return <JobEmptyState title={emptyTitle} message={emptyMessage} />;
  return (
    <div className={variant === "public" ? "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4" : "flex min-w-0 flex-col gap-2"}>
      {jobs.map((job) => {
        const actions = <>{saveAction?.(job)}{secondaryAction?.(job)}</>;
        const posted = postedLabel?.(job) ?? "Date unknown";
        return variant === "public" ? (
          <PublicJobOpportunityCard key={job.id} job={job} postedLabel={posted} ageDays={postedAgeDays?.(job) ?? null} onSelect={() => onSelect(job)} actions={actions} />
        ) : (
          <JobOpportunityCard key={job.id} job={job} variant={variant} selected={job.id === selectedId} postedLabel={posted} onSelect={() => onSelect(job)} saveAction={saveAction || secondaryAction ? actions : undefined} />
        );
      })}
    </div>
  );
}
