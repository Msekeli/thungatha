"use client";

import { Bookmark, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "../job-discovery-utils";
import {
  jobCardActionsClassName,
  jobCardActionClassName,
} from "./job-card-config";
import { ProtectedDiscoveryAction } from "./protected-discovery-action";

export function JobCardActions({
  job,
  configured,
  onSave,
  onHide,
}: {
  job: Job;
  configured: boolean;
  onSave: (job: Job) => void;
  onHide: (job: Job) => void;
}) {
  const saved = job.state === "saved";
  const hidden = job.state === "dismissed";
  const actionBase = jobCardActionClassName + " hover:cursor-pointer";

  return (
    <div className={jobCardActionsClassName}>
      <ProtectedDiscoveryAction
        configured={configured}
        title={saved ? "Remove saved opportunity" : "Save this opportunity"}
        description="Sign in or create a free account to save this job and return to it later."
        onAction={() => onSave(job)}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={[
            actionBase,
            "border-[var(--th-accent)] bg-[var(--th-accent-bg)] text-[var(--th-accent-text)] hover:bg-[var(--th-accent)] hover:text-[var(--th-btn-fg)] aria-pressed:bg-[var(--th-accent)] aria-pressed:text-[var(--th-btn-fg)]",
          ].join(" ")}
          aria-label={
            saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`
          }
          aria-pressed={saved}
        >
          <Bookmark size={16} aria-hidden="true" />
          <span>{saved ? "Saved" : "Save"}</span>
        </Button>
      </ProtectedDiscoveryAction>
      <ProtectedDiscoveryAction
        configured={configured}
        title={hidden ? "Restore this opportunity" : "Hide this opportunity"}
        description="Sign in or create a free account to hide jobs that are not right for you."
        onAction={() => onHide(job)}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={[
            actionBase,
            "border-[var(--th-danger)] bg-[var(--th-danger-bg)] text-[var(--th-danger)] hover:bg-[var(--th-danger)] hover:text-white",
          ].join(" ")}
          aria-label={hidden ? `Restore ${job.title}` : `Hide ${job.title}`}
          aria-pressed={hidden}
        >
          {hidden ? (
            <RotateCcw size={16} aria-hidden="true" />
          ) : (
            <EyeOff size={16} aria-hidden="true" />
          )}
          <span>{hidden ? "Restore" : "Hide"}</span>
        </Button>
      </ProtectedDiscoveryAction>
    </div>
  );
}
