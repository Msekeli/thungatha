"use client";

import { Bookmark, BriefcaseBusiness, ExternalLink, EyeOff, PanelsTopLeft } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Button, ButtonLink } from "@/components/ui/button";
import { JobDetailPresentation, JobDetailEmptyState } from "../shared/job-detail-presentation";

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
function sourceFor(job: PublicJob): PublicJobSource | null {
  if (!job.job_sources) return null;
  return Array.isArray(job.job_sources) ? job.job_sources[0] ?? null : job.job_sources;
}
function dateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function PublicJobDetailPanel({ job, configured, mobileOpen, onBack }: {
  job: PublicJob | null; configured: boolean; mobileOpen: boolean; onBack: () => void;
}) {
  const source = job ? sourceFor(job) : null;
  const applicationUrl = safeUrl(source?.application_url);
  const sourceUrl = safeUrl(source?.source_url);
  const applyUrl = applicationUrl ?? sourceUrl;
  return <aside className={"th-discovery-detail th-jobs-redesign-detail " + (mobileOpen ? "th-detail-mobile-open" : "")} aria-label="Selected job details">
    <div className="th-mobile-detail-heading"><Button variant="ghost" type="button" onClick={onBack}>← Back to results</Button><BriefcaseBusiness size={17}/></div>
    {job ? <JobDetailPresentation job={job} postedAt={source?.published_at || job.updated_at} formatDate={dateLabel}
      headingAction={configured ? <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="ghost" type="button" aria-label="Sign in to save this job"><Bookmark size={18}/></Button></SignInButton> : <a className="th-job-card-save-link" href="/sign-in" aria-label="Sign in to save this job"><Bookmark size={18}/></a>}
      actions={<div className="th-jobs-detail-actions th-jobs-redesign-actions">
        {applyUrl ? <a className="th-apply-button" href={applyUrl} target="_blank" rel="noopener noreferrer">Apply on company site <ExternalLink size={14}/></a> : <p className="th-no-apply">An application link is not available for this listing yet.</p>}
        {configured ? <>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><ButtonLink variant="secondary" href="/cv-studio"><PanelsTopLeft size={14}/> Tailor my CV</ButtonLink></SignInButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="secondary"><Bookmark size={14}/> Save</Button></SignInButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="warning"><EyeOff size={14}/> Dismiss</Button></SignInButton>
        </> : <>
          <a className="th-job-card-save-link" href="/sign-in"><PanelsTopLeft size={14}/> Tailor my CV</a>
          <a className="th-job-card-save-link" href="/sign-in"><Bookmark size={14}/> Save</a>
          <a className="th-job-card-save-link" href="/sign-in"><EyeOff size={14}/> Dismiss</a>
        </>}
      </div>}
      afterDescription={sourceUrl ? <a className="th-source-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">View original listing <ExternalLink size={13}/></a> : null}
    /> : <JobDetailEmptyState />}
  </aside>;
}
