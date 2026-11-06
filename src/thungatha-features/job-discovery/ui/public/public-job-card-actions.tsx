import { Bookmark, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedDiscoveryAction } from "../shared/protected-discovery-action";
import type { Job } from "../job-discovery-utils";

export function PublicJobCardActions({
  job,
  configured,
  onSave,
  onDismiss,
}: {
  job: Job;
  configured: boolean;
  onSave: (job: Job) => void;
  onDismiss: (job: Job) => void;
}) {
  const saved = job.state === "saved";
  const dismissed = job.state === "dismissed";
  return (
    <>
      <ProtectedDiscoveryAction configured={configured} title="Save this opportunity" description="Sign in or create a free account to save this job and return to it later." onAction={() => onSave(job)}>
        <Button variant="ghost" size="icon" aria-label={saved ? `Unsave ${job.title}` : `Save ${job.title}`} title={saved ? "Remove saved job" : "Save job"} className="size-12 rounded-xl text-public-muted hover:bg-panel-2">
          <Bookmark size={24} fill={saved ? "currentColor" : "none"} />
        </Button>
      </ProtectedDiscoveryAction>
      <ProtectedDiscoveryAction configured={configured} title="Dismiss this opportunity" description="Sign in or create a free account to dismiss jobs that are not right for you." onAction={() => onDismiss(job)}>
        <Button variant="ghost" size="icon" aria-label={dismissed ? `Restore ${job.title}` : `Dismiss ${job.title}`} title={dismissed ? "Restore job" : "Not for me"} className="size-12 rounded-xl text-public-muted hover:bg-panel-2 hover:text-danger">
          <ThumbsDown size={24} />
        </Button>
      </ProtectedDiscoveryAction>
    </>
  );
}
