"use client";

import { Bookmark, BriefcaseBusiness, ExternalLink, EyeOff, PanelsTopLeft } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

export function PublicJobDetailPanel({ job, configured, mobileOpen, dismissed = false, onDismiss, onRestore, onBack }: {
  job: PublicJob | null; configured: boolean; mobileOpen: boolean; dismissed?: boolean; onDismiss?: () => void; onRestore?: () => void; onBack: () => void;
}) {
  const source = job ? sourceFor(job) : null;
  const applicationUrl = safeUrl(source?.application_url);
  const sourceUrl = safeUrl(source?.source_url);
  const applyUrl = applicationUrl ?? sourceUrl;
  const signIn = "/sign-in";
  return <Box component="aside" className={`th-discovery-detail th-jobs-redesign-detail ${mobileOpen ? "th-detail-mobile-open" : ""}`} aria-label="Selected job details">
    <Stack direction="row" alignItems="center" spacing={1} className="th-mobile-detail-heading">
      <Button variant="text" onClick={onBack}>← Back to results</Button>
      <BriefcaseBusiness size={17} />
    </Stack>
    {job ? <JobDetailPresentation job={job} postedAt={source?.published_at || job.updated_at} formatDate={dateLabel}
      headingAction={configured ? <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="text" aria-label="Sign in to save this job"><Bookmark size={18}/></Button></SignInButton> : <Button component="a" href={signIn} aria-label="Sign in to save this job" variant="text"><Bookmark size={18}/></Button>}
      actions={<Stack spacing={1} className="th-jobs-detail-actions th-jobs-redesign-actions">
        {applyUrl ? <Button component="a" href={applyUrl} target="_blank" rel="noopener noreferrer" variant="contained">Apply on company site <ExternalLink size={14}/></Button> : <Typography className="th-no-apply" variant="body2">An application link is not available for this listing yet.</Typography>}
        {configured ? <>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="outlined" fullWidth><PanelsTopLeft size={14}/> Tailor my CV</Button></SignInButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="outlined" fullWidth><Bookmark size={14}/> Save</Button></SignInButton>
        </> : <>
          <Button component="a" href={signIn} variant="outlined" fullWidth><PanelsTopLeft size={14}/> Tailor my CV</Button>
          <Button component="a" href={signIn} variant="outlined" fullWidth><Bookmark size={14}/> Save</Button>
        </>}
        {dismissed ? <Button variant="outlined" onClick={onRestore} fullWidth><EyeOff size={14}/> Restore job</Button> : <Button variant="outlined" color="warning" onClick={onDismiss} fullWidth><EyeOff size={14}/> Dismiss</Button>}
      </Stack>}
      afterDescription={sourceUrl ? <Button component="a" href={sourceUrl} target="_blank" rel="noopener noreferrer" variant="text" size="small">View original listing <ExternalLink size={13}/></Button> : null}
    /> : <JobDetailEmptyState />}
  </Box>;
}
