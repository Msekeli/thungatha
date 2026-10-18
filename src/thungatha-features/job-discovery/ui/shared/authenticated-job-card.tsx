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
      className="th-jobs-card th-jobs-redesign-card"
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
    >
      <span className="th-jobs-employer-mark" aria-hidden="true">
        {(job.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="th-jobs-card-main">
        <strong>{job.title}</strong>
        <span>{job.employer_name || "Employer not listed"}</span>
        <small><MapPin size={12} aria-hidden="true" /> {job.location_text || "Location not specified"}</small>
        <span className="th-jobs-redesign-tags">
          <i>{job.employment_type || "Opportunity"}</i>
          {workMode && <i>{workMode}</i>}
          <i><CalendarDays size={11} aria-hidden="true" /> {postedLabel || "Date unknown"}</i>
        </span>
      </span>
      <ChevronRight className="th-jobs-card-chevron" size={18} aria-hidden="true" />
    </button>
  );
}
