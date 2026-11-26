import { ArrowUpRight } from "lucide-react";
import type { JobCardData } from "./job-card-config";
import {
  jobCardEmployerClassName,
  jobCardExternalClassName,
  jobCardHeadingClassName,
  jobCardHeaderClassName,
  jobCardLogoClassName,
  jobCardTitleClassName,
} from "./job-card-config";

export function JobCardHeader({
  job,
  employer,
  initials,
}: {
  job: JobCardData;
  employer: string;
  initials: string;
}) {
  return (
    <div className={jobCardHeaderClassName}>
      {job.company_logo_url ? (
        <img
          src={job.company_logo_url}
          alt=""
          className={jobCardLogoClassName}
        />
      ) : (
        <span className={jobCardLogoClassName}>{initials || "?"}</span>
      )}
      <span className={jobCardHeadingClassName}>
        <span className={jobCardTitleClassName}>{job.title}</span>
        <span className={jobCardEmployerClassName}>{employer}</span>
      </span>
      <ArrowUpRight
        size={22}
        aria-hidden="true"
        className={jobCardExternalClassName}
      />
    </div>
  );
}
