"use client";

import type { ReactNode } from "react";
import { BriefcaseBusiness } from "lucide-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { JobDetailMeta } from "./job-detail-meta";
import { JobDetailDescription } from "./job-detail-description";
import { JobDetailHeading } from "./job-detail-heading";
import { JobSalary } from "./job-salary";

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

export function JobDetailPresentation({
  job,
  postedAt,
  formatDate,
  actions,
  headingAction,
  beforeContent,
  afterDescription,
}: {
  job: JobDetailPresentationData;
  postedAt: string | null;
  formatDate: (value: string | null | undefined) => string | null;
  actions?: ReactNode;
  headingAction?: ReactNode;
  beforeContent?: ReactNode;
  afterDescription?: ReactNode;
}) {
  return (
    <Stack
      className="th-jobs-detail-content"
      key={job.id}
      spacing={1.5}
      sx={{
        display: "flex",
        flex: "1 1 0%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {beforeContent}
      <JobDetailHeading
        title={job.title}
        employer={job.employer_name}
        action={headingAction}
      />
      <JobDetailMeta
        location={job.location_text}
        employmentType={job.employment_type}
        workMode={job.work_mode}
        postedAt={postedAt || job.updated_at}
        formatDate={formatDate}
      />
      <JobSalary
        minimum={job.salary_min}
        maximum={job.salary_max}
        currency={job.salary_currency}
        hideWhenEmpty
        prefix="Salary: "
        locale="en-ZA"
      />
      {actions}
      <JobDetailDescription description={job.description} />
      {afterDescription}
    </Stack>
  );
}

export function JobDetailEmptyState({ children }: { children?: ReactNode }) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems: "center",
        gap: 1.25,
        p: "30px 4px",
        color: "text.secondary",
        fontSize: 12,
        "& > svg": { color: "primary.main", fontSize: 24 },
        "& strong": { color: "text.primary", fontSize: 13, fontWeight: 600 },
        "& p": { m: 0, lineHeight: 1.6 },
      }}
    >
      <BriefcaseBusiness size={24} aria-hidden="true" />
      <Typography variant="h6" component="strong">
        Select an opportunity
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Choose a listing to view its description and application destination.
      </Typography>
      {children}
    </Stack>
  );
}
