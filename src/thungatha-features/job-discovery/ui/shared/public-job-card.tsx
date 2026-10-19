import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import type { JobCardData } from "./job-card";

type Props = {
  job: JobCardData;
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
};

export function PublicJobCard({ job, selected, postedLabel, onSelect }: Props) {
  const workMode = job.work_mode === "onsite" ? "On-site" : job.work_mode === "hybrid" ? "Hybrid" : job.work_mode === "remote" ? "Remote" : null;

  return (
    <button
      type="button"
      className="th-job-card"
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
    >
      <span
        className="th-job-card-logo"
        data-employer={(job.employer_name || "").toLowerCase().replace(/[^a-z]/g, "").slice(0, 8)}
        aria-hidden="true"
      >
        {(job.employer_name || job.title).slice(0, 1).toUpperCase()}
      </span>
      <span className="th-job-card-content">
        <strong className="th-job-card-title">{job.title}</strong>
        <span className="th-job-card-employer">{job.employer_name || "Employer not listed"}</span>
        <span className="th-job-card-location">
          <MapPin size={12} aria-hidden="true" />
          <span>{job.location_text || "Location not specified"}</span>
        </span>
        <span className="th-job-card-tags">
          <i className="th-job-card-tag">{job.employment_type?.replace(/[_-]+/g, " ") || "Full-time"}</i>
          {workMode && <i className="th-job-card-tag">{workMode}</i>}
          <i className="th-job-card-tag"><CalendarDays size={11} aria-hidden="true" /> {postedLabel || "Recently listed"}</i>
        </span>
      </span>
      <span className="th-job-card-aside">
        <ChevronRight size={18} aria-hidden="true" />
      </span>
    </button>
  );
}
