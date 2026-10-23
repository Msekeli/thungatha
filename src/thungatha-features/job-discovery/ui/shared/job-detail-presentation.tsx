"use client";

import type { ReactNode } from "react";
import { JobDetailMeta } from "./job-detail-meta";
import { JobDetailDescription } from "./job-detail-description";
import { JobDetailHeading } from "./job-detail-heading";
import { JobSalary } from "./job-salary";
export { JobDetailEmptyState } from "./job-detail-empty-state";

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

type Props = {
  job: JobDetailPresentationData;
  postedAt: string | null;
  formatDate: (value: string | null | undefined) => string | null;
  actions?: ReactNode;
  headingAction?: ReactNode;
  beforeContent?: ReactNode;
  afterDescription?: ReactNode;
};

export function JobDetailPresentation({
  job,
  postedAt,
  formatDate,
  actions,
  headingAction,
  beforeContent,
  afterDescription,
}: Props) {
  return (
    <div
      className="th-jobs-detail-content flex min-h-0 min-w-0 flex-1 flex-col gap-3"
      key={job.id}
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
    </div>
  );
}
