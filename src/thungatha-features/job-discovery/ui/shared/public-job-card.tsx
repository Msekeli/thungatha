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
      className="th-job-row"
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
    >
      <span className="th-employer-logo" data-employer={(job.employer_name || "").toLowerCase().replace(/[^a-z]/g, "").slice(0, 8)} aria-hidden="true">
        {(job.employer_name || job.title).slice(0, 1).toUpperCase()}
      </span>
      <span className="th-job-row-main">
        <span className="th-job-employer">{job.employer_name || "Employer not listed"}</span>
        <strong>{job.title}</strong>
        <span className="th-job-meta">
          <MapPin size={13} aria-hidden="true" />
          {job.location_text || (job.work_mode === "remote" ? "Remote" : "Location not specified")}
          <span>·</span>
          {job.employment_type?.replace(/[_-]+/g, " ") || "Full-time"}
          <span>·</span>
          {job.work_mode || "Hybrid"}
        </span>
      </span>
      <span className="th-job-row-aside">
        <span>{postedLabel}</span>
        <Bookmark size={17} aria-hidden="true" />
      </span>
    </button>
  );
}
