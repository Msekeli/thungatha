"use client";

import type { ReactNode } from "react";
import { JobDetailMeta } from "./job-detail-meta";
import { JobDetailDescription } from "./job-detail-description";
import { JobDetailHeading } from "./job-detail-heading";
export { JobDetailEmptyState } from "./job-detail-empty-state";

export type JobDetailPresentationData = {
  id: string;
  title: string;
  employer_name: string;
  company_logo_url: string | null;
  description: string;
  location_text: string | null;
  published_at: string | null;
};

type Props = {
  job: JobDetailPresentationData;
  formatDate: (value: string | null | undefined) => string | null;
  actions?: ReactNode;
  headingAction?: ReactNode;
  beforeContent?: ReactNode;
  afterDescription?: ReactNode;
};

export function JobDetailPresentation({
  job,
  formatDate,
  actions,
  headingAction,
  beforeContent,
  afterDescription,
}: Props) {
  return (
    <div className="th-jobs-detail-content flex min-h-0 min-w-0 flex-1 flex-col gap-3" key={job.id}>
      {beforeContent}
      <JobDetailHeading
        title={job.title}
        employer={job.employer_name}
        companyLogoUrl={job.company_logo_url}
        action={headingAction}
      />
      <JobDetailMeta
        location={job.location_text}
        postedAt={job.published_at}
        formatDate={formatDate}
      />
      {actions}
      <JobDetailDescription description={job.description} />
      {afterDescription}
    </div>
  );
}
