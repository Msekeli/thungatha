import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { JobCardData } from "../shared/job-opportunity-card";

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
    <article className="th-job-card group/card">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`View ${job.title} at ${employer}`}
        className="th-job-card__select"
      />
      <div className="th-job-card__header">
        {job.company_logo_url ? (
          <img src={job.company_logo_url} alt="" className="th-job-card__logo" />
        ) : (
          <span className="th-job-card__logo">{initials || "?"}</span>
        )}
        <span className="th-job-card__heading">
          <span className="th-job-card__title">{job.title}</span>
          <span className="th-job-card__employer">{employer}</span>
        </span>
        <ArrowUpRight size={22} aria-hidden="true" className="th-job-card__external" />
      </div>
      <div className="th-job-card__body">
        {job.location_text?.trim() && (
          <div className="th-job-card__metadata">
            <span className="th-job-card__location">
              <MapPin aria-hidden="true" />
              <span>{job.location_text}</span>
            </span>
          </div>
        )}
        <div className="th-job-card__footer">
          {ageDays !== null ? (
            <span className="th-job-card__posted" data-age={ageDays <= 3 ? "new" : "older"}>
              <Clock3 size={14} aria-hidden="true" />
              {postedLabel}
            </span>
          ) : <span />}
          {actions}
        </div>
      </div>
    </article>
  );
}
