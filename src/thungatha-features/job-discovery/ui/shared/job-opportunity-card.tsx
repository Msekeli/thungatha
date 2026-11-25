"use client";

import type { ReactNode } from "react";
import type { JobCardData } from "./job-card-config";
import {
  jobCardClassName,
  jobCardSelectClassName,
} from "./job-card-config";
import { JobCardDetails } from "./job-card-details";
import { JobCardHeader } from "./job-card-header";

export type { JobCardData } from "./job-card-config";

function postedAgeDays(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

type Props = {
  job: JobCardData;
  variant?: "public" | "authenticated";
  selected: boolean;
  postedLabel?: string;
  onSelect: () => void;
  saveAction?: ReactNode;
};

export function JobOpportunityCard({
  job,
  selected,
  postedLabel,
  onSelect,
  saveAction,
}: Props) {
  const employer = job.employer_name?.trim() || "Employer not listed";
  const initials = employer
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className={jobCardClassName} data-selected={selected}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`View ${job.title} at ${employer}`}
        className={jobCardSelectClassName}
      />
      <JobCardHeader job={job} employer={employer} initials={initials} />
      <JobCardDetails
        job={job}
        ageDays={postedAgeDays(job.published_at)}
        postedLabel={postedLabel}
        actions={saveAction}
      />
    </article>
  );
}
