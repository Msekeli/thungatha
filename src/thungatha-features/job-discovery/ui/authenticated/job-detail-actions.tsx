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
    <div className="flex w-full flex-col gap-2">
      <Button
        className={`${actionClass} min-h-11 w-full justify-center text-base sm:min-h-10 sm:text-sm`}
        disabled={!applicationDestination || disabled}
        title={applicationUrl ? "Opens the employer's application page" : "No application link is available"}
        data-job-application-trigger
        onClick={(event) => onApply(event.currentTarget)}
      >
        <ExternalLink size={16} aria-hidden="true" />
        Apply on company site
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
