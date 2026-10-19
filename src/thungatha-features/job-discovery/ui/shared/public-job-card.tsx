import { Bookmark, MapPin } from "lucide-react";
import type { JobCardData } from "./job-card";

type Props = {
  job: JobCardData;
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
};

export function PublicJobCard({ job, selected, postedLabel, onSelect }: Props) {
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
        <span className="th-job-card-employer">{job.employer_name || "Employer not listed"}</span>
        <strong className="th-job-card-title">{job.title}</strong>
        <span className="th-job-card-location">
          <MapPin size={13} aria-hidden="true" />
          {job.location_text || (job.work_mode === "remote" ? "Remote" : "Location not specified")}
          <span aria-hidden="true">·</span>
          {job.employment_type?.replace(/[_-]+/g, " ") || "Full-time"}
          <span aria-hidden="true">·</span>
          {job.work_mode || "Hybrid"}
        </span>
      </span>
      <span className="th-job-card-aside">
        <span>{postedLabel}</span>
        <Bookmark size={17} aria-hidden="true" />
      </span>
    </button>
  );
}
