import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import type { JobCardData } from "./job-card";

type Props = {
  job: JobCardData;
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
};

export function AuthenticatedJobCard({ job, selected, postedLabel, onSelect }: Props) {
  const workMode =
    job.work_mode === "onsite" ? "On-site" :
    job.work_mode === "hybrid" ? "Hybrid" :
    job.work_mode === "remote" ? "Remote" : null;

  return (
    <button
      type="button"
      className="th-jobs-card th-jobs-redesign-card !flex !w-full !min-w-0 !items-start !gap-3 !text-left focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-accent"
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
    >
      <span className="th-jobs-employer-mark !shrink-0" aria-hidden="true">
        {(job.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="th-jobs-card-main !flex !min-w-0 !flex-1 !flex-col">
        <strong className="!break-words">{job.title}</strong>
        <span>{job.employer_name || "Employer not listed"}</span>
        <small className="!flex !min-w-0 !items-center !gap-1">
          <MapPin size={12} aria-hidden="true" />
          <span className="!min-w-0 !break-words">{job.location_text || "Location not specified"}</span>
        </small>
        <span className="th-jobs-redesign-tags !flex !flex-wrap !items-center">
          <i>{job.employment_type?.replace(/[_-]+/g, " ") || "Opportunity"}</i>
          {workMode && <i>{workMode}</i>}
          <i><CalendarDays size={11} aria-hidden="true" /> {postedLabel || "Date unknown"}</i>
        </span>
      </span>
      <ChevronRight className="th-jobs-card-chevron !shrink-0" size={18} aria-hidden="true" />
    </button>
  );
}
