import { Bookmark, ExternalLink } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import Button from "@mui/material/Button";
import { PublicJobDetailActions } from "./public-job-detail-actions";
import { JobDetailPresentation } from "../shared/job-detail-presentation";
import type { PublicJob } from "./public-job-types";

function dateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}

export function PublicJobDetailContent({
  job,
  configured,
  dismissed,
  applyUrl,
  sourceUrl,
  signInUrl,
  onDismiss,
  onRestore,
}: {
  job: PublicJob;
  configured: boolean;
  dismissed: boolean;
  applyUrl: string | null;
  sourceUrl: string | null;
  signInUrl: string;
  onDismiss?: () => void;
  onRestore?: () => void;
}) {
  return (
    <JobDetailPresentation
      job={job}
      postedAt={
        job.job_sources && !Array.isArray(job.job_sources)
          ? job.job_sources.published_at || job.updated_at
          : (Array.isArray(job.job_sources)
              ? job.job_sources[0]?.published_at
              : null) || job.updated_at
      }
      formatDate={dateLabel}
      headingAction={
        configured ? (
          <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
            <Button variant="text" aria-label="Sign in to save this job">
              <Bookmark size={18} />
            </Button>
          </SignInButton>
        ) : (
          <Button
            component="a"
            href={signInUrl}
            aria-label="Sign in to save this job"
            variant="text"
          >
            <Bookmark size={18} />
          </Button>
        )
      }
      actions={
        <PublicJobDetailActions
          configured={configured}
          applyUrl={applyUrl}
          signInUrl={signInUrl}
          dismissed={dismissed}
          onDismiss={onDismiss}
          onRestore={onRestore}
        />
      }
      afterDescription={
        sourceUrl ? (
          <Button
            component="a"
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="small"
          >
            View original listing <ExternalLink size={13} />
          </Button>
        ) : null
      }
    />
  );
}
