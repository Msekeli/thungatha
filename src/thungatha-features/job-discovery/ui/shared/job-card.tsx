import {
  Bookmark,
  CalendarDays,
  ChevronRight,
  MapPin,
} from "lucide-react";
export type JobCardData = {
  id: string;
  title: string;
  employer_name: string | null;
  location_text: string | null;
  work_mode: string | null;
  employment_type: string | null;
};
type JobCardProps = {
  job: JobCardData;
  variant: "public" | "authenticated";
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
};
export function JobCard({
  job,
  variant,
  selected,
  postedLabel,
  onSelect,
}: JobCardProps) {
  if (variant === "public") {
    return (
      <button
        type="button"
        className="th-job-row"
        data-selected={selected}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
      >
        <span
          className="th-employer-logo"
          data-employer={(job.employer_name || "").toLowerCase().replace(/[^a-z]/g, "").slice(0, 8)}
          aria-hidden="true"
        >
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
  const workMode =
    job.work_mode === "onsite"
      ? "On-site"
      : job.work_mode === "hybrid"
        ? "Hybrid"
        : job.work_mode === "remote"
          ? "Remote"
          : null;
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
        <small>
          <MapPin size={12} aria-hidden="true" /> {job.location_text || "Location not specified"}
        </small>
        <span className="th-jobs-redesign-tags">
          <i>{job.employment_type || "Opportunity"}</i>
          {workMode && <i>{workMode}</i>}
          <i>
            <CalendarDays size={11} aria-hidden="true" /> {postedLabel || "Date unknown"}
          </i>
        </span>
      </span>
      <ChevronRight className="th-jobs-card-chevron" size={18} aria-hidden="true" />
    </button>
  );
}