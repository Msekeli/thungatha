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
  applyOnly?: boolean;
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
  applyOnly = false,
}: Props) {
  const disabled = busy || detailLoading;
  const actionClass = "th-job-detail-action-button";

  return (
    <div className={applyOnly ? "flex" : "th-job-detail-actions"}>
      <Button
        className={`${actionClass} max-[600px]:h-11 max-[600px]:w-full max-[600px]:text-base`}
        disabled={!applicationDestination || disabled}
        title={applicationUrl ? "Opens the employer's application page" : "No application link is available"}
        data-job-application-trigger
        onClick={(event) => onApply(event.currentTarget)}
      >
        <ExternalLink size={14} aria-hidden="true" />
        Apply on company site
      </Button>
      {!applyOnly && (
        <JobDetailProtectedActions
          configured={configured}
          job={job}
          disabled={disabled}
          onSave={onSave}
          onDismiss={onDismiss}
        />
      )}
    </div>
  );
}
