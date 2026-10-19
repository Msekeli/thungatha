"use client";

import { Bookmark, BriefcaseBusiness, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
export function PublicJobDetailPanel({ job, configured, mobileOpen, onBack, tab, setTab }: {
  job: PublicJob | null; configured: boolean; mobileOpen: boolean; onBack: () => void;
  tab: string; setTab: (tab: string) => void;
}) {
  const source = job ? sourceFor(job) : null;
  const applyUrl = safeUrl(source?.application_url) ?? safeUrl(source?.source_url);
  const description = job?.description?.trim();
  return <aside className={"th-discovery-detail " + (mobileOpen ? "th-detail-mobile-open" : "")} aria-label="Selected job details">
    <div className="th-mobile-detail-heading"><Button variant="ghost" type="button" onClick={onBack}>← Back to results</Button><Bookmark size={17}/></div>
    {job ? <>
      <div className="th-detail-actions-top"><span className="th-employer-logo th-employer-logo-large">{(job.employer_name || job.title).slice(0, 1).toUpperCase()}</span>
        {configured && <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="ghost" type="button" className="th-icon-button" aria-label="Sign in to save this job"><Bookmark size={18}/></Button></SignInButton>}
      </div>
      <div className="th-detail-employer">{job.employer_name || "Employer not listed"}</div><h1>{job.title}</h1>
      <div className="th-detail-facts"><span><MapPin size={14}/>{job.location_text || "Location not specified"}</span><span><BriefcaseBusiness size={14}/>{job.employment_type?.replace(/[_-]+/g, " ") || "Full-time"}</span><span><CalendarDays size={14}/>{job.work_mode || "Hybrid"}</span>{salaryLabel(job) && <span>{salaryLabel(job)}</span>}</div>
      {applyUrl ? <a className="th-apply-button" href={applyUrl} target="_blank" rel="noopener noreferrer">Apply on {job.employer_name || "employer site"} <ExternalLink size={15}/></a> : <p className="th-no-apply">An application link is not available for this listing yet.</p>}
      <div className="th-detail-tabs" role="tablist" aria-label="Job information">{["Overview", "Requirements", "About"].map(item => <Button variant="ghost" type="button" role="tab" aria-selected={tab === item} data-active={tab === item} key={item} onClick={() => setTab(item)}>{item}</Button>)}</div>
      <div className="th-detail-description"><h2>{tab === "Requirements" ? "Requirements" : tab === "About" ? "About the company" : "Job description"}</h2><p>{description || "The employer has not supplied a full description for this listing."}</p>
        {tab === "Overview" && <><h2 className="th-detail-subheading">Key responsibilities</h2><p>{job.description ? job.description.split(". ").slice(0, 3).join(". ") : "Review the original listing for responsibilities and role details."}</p></>}
        {tab === "Requirements" && <p>Review the employer listing for required experience, qualifications and skills.</p>}
        {tab === "About" && <p>{job.employer_name || "The employer"} — view the original listing for more company information.</p>}
      </div>
      {source?.source_url && <a className="th-source-link" href={safeUrl(source.source_url) ?? "#"} target="_blank" rel="noopener noreferrer">View original listing <ExternalLink size={13}/></a>}
    </> : <div className="th-discovery-empty"><BriefcaseBusiness size={25}/><strong>Select a job</strong><p>Choose a listing to see more information.</p></div>}
  </aside>;
}
