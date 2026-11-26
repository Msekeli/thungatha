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
    <div
      className="flex min-w-0 items-center gap-3 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-0"
    >
      <Button
        className={`${actionClass} min-h-11 min-w-0 flex-1 justify-center max-[600px]:min-h-12 max-[600px]:w-full`}
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
      <div
        className="min-w-0 max-[600px]:block max-[600px]:w-full max-[600px]:[&>div]:w-full max-[600px]:[&>div]:flex-col max-[600px]:[&>div]:items-stretch max-[600px]:[&>div]:gap-2 max-[600px]:[&>div>span]:block max-[600px]:[&>div>span]:w-full max-[600px]:[&_a]:min-h-11 max-[600px]:[&_a]:w-full max-[600px]:[&_a]:justify-center max-[600px]:[&_button]:min-h-11 max-[600px]:[&_button]:w-full max-[600px]:[&_button]:justify-center"
      >
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
