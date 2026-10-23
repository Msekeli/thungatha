"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Bookmark, Check, EyeOff, PanelsTopLeft } from "lucide-react";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";

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
    <>
      <ProtectedDiscoveryAction
        configured={configured}
        title="Tailor your CV"
        description="Sign in or create a free account to tailor your CV to this opportunity."
      >
        <Link
          className={buttonVariants({ variant: "outline", className: actionClass })}
          href={`/cv-studio?jobId=${encodeURIComponent(job.id)}`}
        >
          <PanelsTopLeft size={14} aria-hidden="true" />
          Tailor my CV
        </Link>
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
      <ProtectedDiscoveryAction
        configured={configured}
        title="Personalise your job feed"
        description="Sign in or create a free account to dismiss jobs you are not interested in."
        onAction={onDismiss}
      >
        <Button variant="warning" className={actionClass} disabled={disabled}>
          {job.state === "dismissed" ? null : (
            <EyeOff size={14} aria-hidden="true" />
          )}
          {job.state === "dismissed" ? "Restore" : "Dismiss"}
        </Button>
      </ProtectedDiscoveryAction>
    </>
  );
}
