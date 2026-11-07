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
  busy,
  detailLoading,
  onApply,
  onSave,
  onDismiss,
}: Props) {
  const disabled = busy || detailLoading;
  const actionClass = "th-job-detail-action-button";

  return (
    <div className="th-job-detail-actions-layout">
      <Button
        className={`${actionClass} th-job-detail-apply-button`}
        disabled={!applicationDestination || disabled}
        title={
          applicationUrl
            ? "Opens the employer's application page"
            : "No application link is available"
        }
        data-job-application-trigger
        onClick={(event) => onApply(event.currentTarget)}
      >
        <ExternalLink size={16} aria-hidden="true" />
        Apply on company site
      </Button>
      <div className="th-job-detail-secondary-actions">
        <JobDetailProtectedActions
          configured={configured}
          job={job}
          disabled={disabled}
          onSave={onSave}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
}
