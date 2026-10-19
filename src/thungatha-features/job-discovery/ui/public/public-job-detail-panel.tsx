"use client";

import { Bookmark, BriefcaseBusiness, ExternalLink } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { JobDetailMeta } from "../shared/job-detail-meta";
import { JobDetailDescription } from "../shared/job-detail-description";

export type PublicJobSource = {
  source_url: string | null;
  application_url: string | null;
  published_at: string | null;
  availability_status: string;
  provider_kind: string;
};
export type PublicJob = {
  id: string; title: string; employer_name: string | null; description: string | null;
  location_text: string | null; country_code: string | null; work_mode: string | null;
  employment_type: string | null; salary_min: number | null; salary_max: number | null;
  salary_currency: string | null; updated_at: string | null;
  job_sources: PublicJobSource[] | PublicJobSource | null; state: "saved" | "dismissed" | null;
};
function safeUrl(value: string | null | undefined): string | null {
  try { const url = new URL(value || ""); return ["https:", "http:"].includes(url.protocol) ? url.toString() : null; }
  catch { return null; }
}
function salaryLabel(job: PublicJob): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency || "ZAR";
  const format = (n: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (job.salary_min != null && job.salary_max != null) return format(job.salary_min) + " – " + format(job.salary_max);
  return format((job.salary_min ?? job.salary_max)!);
}
function sourceFor(job: PublicJob): PublicJobSource | null {
  if (!job.job_sources) return null;
  return Array.isArray(job.job_sources) ? job.job_sources[0] ?? null : job.job_sources;
}
export function PublicJobDetailPanel({ job, configured, mobileOpen, onBack }: {
  job: PublicJob | null; configured: boolean; mobileOpen: boolean; onBack: () => void;
}) {
  const source = job ? sourceFor(job) : null;
  const applyUrl = safeUrl(source?.application_url) ?? safeUrl(source?.source_url);
  const sourceUrl = safeUrl(source?.source_url);
  return <aside className={"th-discovery-detail th-jobs-redesign-detail " + (mobileOpen ? "th-detail-mobile-open" : "")} aria-label="Selected job details">
    <div className="th-mobile-detail-heading"><Button variant="ghost" type="button" onClick={onBack}>← Back to results</Button><BriefcaseBusiness size={17}/></div>
    {job ? <>
      <div className="th-jobs-detail-content">
        <div className="th-jobs-redesign-job-head">
          <span className="th-jobs-employer-mark th-jobs-detail-logo">{(job.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}</span>
          <div className="th-jobs-redesign-title">
            <p className="th-detail-employer">{job.employer_name || "Employer not listed"}</p>
            <h1>{job.title}</h1>
          </div>
          {configured && <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="ghost" type="button" aria-label="Sign in to save this job"><Bookmark size={18}/></Button></SignInButton>}
        </div>
        <JobDetailMeta location={job.location_text} employmentType={job.employment_type}
          workMode={job.work_mode} postedAt={source?.published_at || job.updated_at}
          formatDate={(value) => value ? new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : null} />
        {salaryLabel(job) && <p className="th-jobs-detail-salary"><strong>Salary:</strong> {salaryLabel(job)}</p>}
        {applyUrl ? <a className="th-apply-button" href={applyUrl} target="_blank" rel="noopener noreferrer">Apply on {job.employer_name || "employer site"} <ExternalLink size={15}/></a> : <p className="th-no-apply">An application link is not available for this listing yet.</p>}
        <JobDetailDescription description={job.description} />
        {sourceUrl && <a className="th-source-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">View original listing <ExternalLink size={13}/></a>}
      </div>
    </> : <div className="th-discovery-empty"><BriefcaseBusiness size={25}/><strong>Select a job</strong><p>Choose a listing to see more information.</p></div>}
  </aside>;
}
