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
      className="th-job-row !flex !w-full !min-w-0 !items-start !gap-3 !text-left focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-accent"
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
    >
      <span
        className="th-employer-logo !flex !shrink-0 !items-center !justify-center"
        data-employer={(job.employer_name || "").toLowerCase().replace(/[^a-z]/g, "").slice(0, 8)}
        aria-hidden="true"
      >
        {(job.employer_name || job.title).slice(0, 1).toUpperCase()}
      </span>
      <span className="th-job-row-main !flex !min-w-0 !flex-1 !flex-col">
        <span className="th-job-employer">{job.employer_name || "Employer not listed"}</span>
        <strong className="!break-words">{job.title}</strong>
        <span className="th-job-meta !flex !flex-wrap !items-center">
          <MapPin size={13} aria-hidden="true" />
          {job.location_text || (job.work_mode === "remote" ? "Remote" : "Location not specified")}
          <span aria-hidden="true">·</span>
          {job.employment_type?.replace(/[_-]+/g, " ") || "Full-time"}
          <span aria-hidden="true">·</span>
          {job.work_mode || "Hybrid"}
        </span>
      </span>
      <span className="th-job-row-aside !flex !shrink-0 !flex-col !items-end !justify-between">
        <span>{postedLabel}</span>
        <Bookmark size={17} aria-hidden="true" />
      </span>
    </button>
  );
}
