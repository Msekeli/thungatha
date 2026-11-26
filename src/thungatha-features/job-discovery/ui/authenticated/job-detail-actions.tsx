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
    <div className="flex min-w-0 items-center gap-3 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-0">
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
      <div className="min-w-0 max-[600px]:block max-[600px]:w-full [&>div]:max-[600px]:w-full [&>div]:max-[600px]:flex-col [&>div]:max-[600px]:items-stretch [&>div]:max-[600px]:gap-2 [&_a]:max-[600px]:min-h-11 [&_a]:max-[600px]:w-full [&_a]:max-[600px]:justify-center [&_button]:max-[600px]:min-h-11 [&_button]:max-[600px]:w-full [&_button]:max-[600px]:justify-center">
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
