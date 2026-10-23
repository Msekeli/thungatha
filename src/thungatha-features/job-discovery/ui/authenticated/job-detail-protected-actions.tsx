"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Bookmark, Check, PanelsTopLeft } from "lucide-react";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";
import { JobDetailDismissAction } from "./job-detail-dismiss-action";

export function JobDetailProtectedActions({
  configured,
  job,
  disabled,
  onSave,
  onDismiss,
}: {
  configured: boolean;
  job: { id: string; title: string; state: "saved" | "dismissed" | null };
  disabled: boolean;
  onSave: () => void;
  onDismiss: () => void;
}) {
  const actionClass = "th-job-detail-action-button";

  return (
    <div className="flex flex-wrap items-center gap-2 max-[600px]:w-full">
      <ProtectedDiscoveryAction
        configured={configured}
        title="Tailor your CV"
        description="Sign in or create a free account to tailor your CV to this opportunity."
      >
        <ButtonLink
          variant="outline"
          className={actionClass}
          href={`/cv-studio?jobId=${encodeURIComponent(job.id)}`}
        >
          <PanelsTopLeft size={14} aria-hidden="true" />
          Tailor my CV
        </ButtonLink>
      </ProtectedDiscoveryAction>
      <ProtectedDiscoveryAction
        configured={configured}
        title="Save this opportunity"
        description="Sign in or create a free account to save this job and return to it later."
        onAction={onSave}
      >
        <Button variant="outline" className={actionClass} disabled={disabled}>
          {job.state === "saved" ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Bookmark size={14} aria-hidden="true" />
          )}
          {job.state === "saved" ? "Saved" : "Save"}
        </Button>
      </ProtectedDiscoveryAction>
      <JobDetailDismissAction
        configured={configured}
        disabled={disabled}
        dismissed={job.state === "dismissed"}
        onDismiss={onDismiss}
      />
    </div>
  );
}
