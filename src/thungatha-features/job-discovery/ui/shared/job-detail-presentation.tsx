"use client";

import type { ReactNode } from "react";
import { BriefcaseBusiness, ExternalLink } from "lucide-react";
import { JobDetailMeta } from "./job-detail-meta";
import { JobDetailDescription } from "./job-detail-description";

export type JobDetailPresentationData = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  work_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
};

function salaryLabel(job: JobDetailPresentationData): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency || "ZAR";
  const format = (value: number) => new Intl.NumberFormat("en-ZA", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(value);
  if (job.salary_min != null && job.salary_max != null) return `${format(job.salary_min)} – ${format(job.salary_max)}`;
  return format((job.salary_min ?? job.salary_max)!);
}

export function JobDetailPresentation({
  job, postedAt, formatDate, actions, headingAction, beforeContent, afterDescription,
}: {
  job: JobDetailPresentationData;
  postedAt: string | null;
  formatDate: (value: string | null | undefined) => string | null;
  actions?: ReactNode;
  headingAction?: ReactNode;
  beforeContent?: ReactNode;
  afterDescription?: ReactNode;
}) {
  const salary = salaryLabel(job);
  return <div className="th-jobs-detail-content" key={job.id}>
    {beforeContent}
    <div className="th-jobs-redesign-job-head">
      <span className="th-jobs-employer-mark th-jobs-detail-logo">{(job.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}</span>
      <div className="th-jobs-redesign-title">
        <h2>{job.title}</h2>
        <p>{job.employer_name?.trim() || "Employer not listed"} <ExternalLink className="th-jobs-external-mark" size={13} aria-label="External employer link" /></p>
      </div>
      {headingAction}
    </div>
    <JobDetailMeta location={job.location_text} employmentType={job.employment_type}
      workMode={job.work_mode} postedAt={postedAt || job.updated_at} formatDate={formatDate} />
    {salary && <p className="th-jobs-detail-salary"><strong>Salary:</strong> {salary}</p>}
    {actions}
    <JobDetailDescription description={job.description} />
    {afterDescription}
  </div>;
}

export function JobDetailEmptyState({ children }: { children?: ReactNode }) {
  return <div className="th-jobs-detail-placeholder">
    <BriefcaseBusiness size={24} aria-hidden="true" />
    <strong>Select an opportunity</strong>
    <p>Choose a listing to view its description and application destination.</p>
    {children}
  </div>;
}
