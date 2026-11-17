"use client";

import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";

export type JobCardData = {
  id: string;
  title: string;
  employer_name: string;
  company_logo_url: string | null;
  location_text: string | null;
  published_at?: string | null;
};

type Props = {
  job: JobCardData;
  variant?: "public" | "authenticated";
  selected: boolean;
  postedLabel?: string;
  onSelect: () => void;
  saveAction?: ReactNode;
};

export function JobOpportunityCard({
  job,
  selected,
  postedLabel,
  onSelect,
  saveAction,
}: Props) {
  const employer = job.employer_name?.trim() || "Employer not listed";
  const initials = employer
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const ageDays = job.published_at
    ? Math.max(0, Math.floor((Date.now() - new Date(job.published_at).getTime()) / 86_400_000))
    : null;

  return (
    <article className="th-job-card" data-selected={selected}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
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
          {postedLabel ? (
            <span className="th-job-card__posted" data-age={ageDays !== null && ageDays <= 3 ? "new" : "older"}>
              <Clock3 size={14} aria-hidden="true" />
              {postedLabel}
            </span>
          ) : <span />}
          {saveAction}
        </div>
      </div>
    </article>
  );
}
