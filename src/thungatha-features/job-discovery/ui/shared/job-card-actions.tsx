"use client";

import { Bookmark, EyeOff, RotateCcw } from "lucide-react";
import type { Job } from "../job-discovery-utils";
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

  return (
    <div className="th-job-card__actions">
      <ProtectedDiscoveryAction
        configured={configured}
        title={saved ? "Remove saved opportunity" : "Save this opportunity"}
        description="Sign in or create a free account to save this job and return to it later."
        onAction={() => onSave(job)}
      >
        <button
          type="button"
          className="th-job-card__action th-job-card__action--save"
          aria-label={
            saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`
          }
          aria-pressed={saved}
        >
          <Bookmark size={16} aria-hidden="true" />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
      </ProtectedDiscoveryAction>
      <ProtectedDiscoveryAction
        configured={configured}
        title={hidden ? "Restore this opportunity" : "Hide this opportunity"}
        description="Sign in or create a free account to hide jobs that are not right for you."
        onAction={() => onHide(job)}
      >
        <button
          type="button"
          className="th-job-card__action th-job-card__action--hide"
          aria-label={hidden ? `Restore ${job.title}` : `Hide ${job.title}`}
          aria-pressed={hidden}
        >
          {hidden ? (
            <RotateCcw size={16} aria-hidden="true" />
          ) : (
            <EyeOff size={16} aria-hidden="true" />
          )}
          <span>{hidden ? "Restore" : "Hide"}</span>
        </button>
      </ProtectedDiscoveryAction>
    </div>
  );
}
