"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { JobDetailProtectedActions } from "./job-detail-protected-actions";

type JobState = "saved" | "dismissed" | null;
type Job = { id: string; title: string; state: JobState };
type Props = {
  configured: boolean;
  job: Job;
  applicationDestination: string | null;
  applicationUrl: string | null;
  jobSourceUrl: string | null;
  busy: boolean;
  detailLoading: boolean;
  onApply: (anchorEl: HTMLElement) => void;
  onSave: () => void;
  onDismiss: () => void;
};

export function JobDetailActions({
  configured,
  job,
  applicationDestination,
  applicationUrl,
  jobSourceUrl,
  busy,
  detailLoading,
  onApply,
  onSave,
  onDismiss,
}: Props) {
  const disabled = busy || detailLoading;
  const applyTitle = applicationUrl
    ? "Opens the supplied application destination"
    : jobSourceUrl
      ? "Opens the available source listing; it may not be the employer application page"
      : "No job or application link is available";
  const actionClass = "th-job-detail-action-button";

  return (
    <div className="th-job-detail-actions">
      <Button
        className={`${actionClass} max-[600px]:h-11 max-[600px]:w-full max-[600px]:text-base`}
        disabled={!applicationDestination || disabled}
        title={applyTitle}
        data-job-application-trigger
        onClick={(event) => onApply(event.currentTarget)}
      >
        <ExternalLink size={14} aria-hidden="true" />
        {applicationUrl ? "Apply on company site" : "Open job listing"}
      </Button>
      <JobDetailProtectedActions
        configured={configured}
        job={job}
        disabled={disabled}
        onSave={onSave}
        onDismiss={onDismiss}
      />
    </div>
  );
}
