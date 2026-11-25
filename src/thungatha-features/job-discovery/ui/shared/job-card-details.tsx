import { Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { JobCardData } from "./job-card-config";
import {
  jobCardBodyClassName,
  jobCardFooterClassName,
  jobCardLocationClassName,
  jobCardMetadataClassName,
  jobCardPostedClassName,
} from "./job-card-config";

export function JobCardDetails({
  job,
  ageDays,
  postedLabel,
  actions,
}: {
  job: JobCardData;
  ageDays: number | null;
  postedLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={jobCardBodyClassName}>
      {(job.location_text?.trim() ||
        job.matchClassification === "match" ||
        job.matchClassification === "relevant") && (
        <div className={jobCardMetadataClassName}>
          {job.location_text?.trim() && (
            <span className={jobCardLocationClassName}>
              <MapPin
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span>{job.location_text}</span>
            </span>
          )}
          {job.matchClassification === "match" && (
            <span className="th-tag" data-tone="success">
              Match
            </span>
          )}
          {job.matchClassification === "relevant" && (
            <span className="th-tag" data-tone="info">
              Relevant
            </span>
          )}
        </div>
      )}
      <div className={jobCardFooterClassName}>
        {postedLabel ? (
          <span
            className={jobCardPostedClassName}
            data-age={ageDays !== null && ageDays <= 3 ? "new" : "older"}
          >
            <Clock3 size={14} aria-hidden="true" />
            {postedLabel}
          </span>
        ) : (
          <span />
        )}
        {actions}
      </div>
    </div>
  );
}
