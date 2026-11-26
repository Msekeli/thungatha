import type { ReactNode } from "react";
import type { JobCardData } from "../shared/job-card-config";
import {
  jobCardClassName,
  jobCardSelectClassName,
} from "../shared/job-card-config";
import { JobCardDetails } from "../shared/job-card-details";
import { JobCardHeader } from "../shared/job-card-header";

export function PublicJobOpportunityCard({
  job,
  ageDays,
  postedLabel,
  onSelect,
  actions,
}: {
  job: JobCardData;
  ageDays: number | null;
  postedLabel: string;
  onSelect: () => void;
  actions?: ReactNode;
}) {
  const employer = job.employer_name?.trim() || "Employer not listed";
  const initials = employer
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className={jobCardClassName}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`View ${job.title} at ${employer}`}
        className={jobCardSelectClassName}
      />
      <JobCardHeader job={job} employer={employer} initials={initials} />
      <JobCardDetails
        job={job}
        ageDays={ageDays}
        postedLabel={postedLabel}
        actions={actions}
      />
    </article>
  );
}
