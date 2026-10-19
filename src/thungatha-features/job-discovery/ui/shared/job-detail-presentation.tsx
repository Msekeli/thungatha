"use client";

import type { ReactNode } from "react";
import { BriefcaseBusiness, ExternalLink } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { JobDetailMeta } from "./job-detail-meta";
import { JobDetailDescription } from "./job-detail-description";

export type JobDetailPresentationData = {
  id: string; title: string; employer_name: string | null; description: string | null;
  location_text: string | null; work_mode: string | null; employment_type: string | null;
  salary_min: number | null; salary_max: number | null; salary_currency: string | null;
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
  job: JobDetailPresentationData; postedAt: string | null;
  formatDate: (value: string | null | undefined) => string | null;
  actions?: ReactNode; headingAction?: ReactNode; beforeContent?: ReactNode; afterDescription?: ReactNode;
}) {
  const salary = salaryLabel(job);
  return <Stack className="th-jobs-detail-content" key={job.id} spacing={2}>
    {beforeContent}
    <Stack direction="row" alignItems="center" spacing={2} className="th-jobs-redesign-job-head">
      <Avatar className="th-jobs-employer-mark th-jobs-detail-logo">{(job.employer_name?.trim() || "?").slice(0, 1).toUpperCase()}</Avatar>
      <Box className="th-jobs-redesign-title" flex={1} minWidth={0}>
        <Typography variant="h5" component="h2">{job.title}</Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography color="text.secondary">{job.employer_name?.trim() || "Employer not listed"}</Typography>
          <ExternalLink className="th-jobs-external-mark" size={13} aria-label="External employer link" />
        </Stack>
      </Box>
      {headingAction}
    </Stack>
    <JobDetailMeta location={job.location_text} employmentType={job.employment_type}
      workMode={job.work_mode} postedAt={postedAt || job.updated_at} formatDate={formatDate} />
    {salary && <Typography className="th-jobs-detail-salary"><strong>Salary:</strong> {salary}</Typography>}
    {actions}
    <JobDetailDescription description={job.description} />
    {afterDescription}
  </Stack>;
}

export function JobDetailEmptyState({ children }: { children?: ReactNode }) {
  return <Stack className="th-jobs-detail-placeholder" alignItems="center" spacing={1.5}>
    <BriefcaseBusiness size={24} aria-hidden="true" />
    <Typography variant="h6" component="strong">Select an opportunity</Typography>
    <Typography color="text.secondary" variant="body2">Choose a listing to view its description and application destination.</Typography>
    {children}
  </Stack>;
}
