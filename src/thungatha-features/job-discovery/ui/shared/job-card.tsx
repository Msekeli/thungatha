"use client";

import "./job-discovery-components.css";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";

export type JobCardData = {
  id: string;
  title: string;
  employer_name: string | null;
  location_text: string | null;
  work_mode: string | null;
  employment_type: string | null;
};

type Props = {
  job: JobCardData;
  variant: "public" | "authenticated";
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
  saveAction?: ReactNode;
};

export function JobCard({ job, selected, postedLabel, onSelect, saveAction }: Props) {
  const workMode =
    job.work_mode === "onsite" ? "On-site" :
    job.work_mode === "hybrid" ? "Hybrid" :
    job.work_mode === "remote" ? "Remote" : null;

  return (
    <article className="th-job-card-row" data-selected={selected}>
      <button
        type="button"
        className="th-job-card"
        data-selected={selected}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${job.title}, ${job.employer_name || "Employer not listed"}, ${job.location_text || "Location not specified"}`}
      >
        <span className="th-job-card-logo" aria-hidden="true">
          {(job.employer_name?.trim() || job.title || "?").slice(0, 1).toUpperCase()}
        </span>
        <span className="th-job-card-content">
          <strong className="th-job-card-title">{job.title}</strong>
          <span className="th-job-card-employer">{job.employer_name || "Employer not listed"}</span>
          <span className="th-job-card-location">
            <MapPin size={12} aria-hidden="true" />
            <span>{job.location_text || "Location not specified"}</span>
          </span>
          <span className="th-job-card-tags">
            <i className="th-job-card-tag">{job.employment_type?.replace(/[_-]+/g, " ") || "Opportunity"}</i>
            {workMode && <i className="th-job-card-tag">{workMode}</i>}
            <i className="th-job-card-tag"><CalendarDays size={11} aria-hidden="true" /> {postedLabel || "Date unknown"}</i>
          </span>
        </span>
        <ChevronRight className="th-job-card-chevron" size={18} aria-hidden="true" />
      </button>
      {saveAction && <div className="th-job-card-save">{saveAction}</div>}
    </article>
  );
}
