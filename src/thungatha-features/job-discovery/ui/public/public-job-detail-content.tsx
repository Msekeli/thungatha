"use client";
import { useState } from "react";
import { ExternalLink, UserRoundSearch } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { MatchBreakdownDialog } from "../authenticated/match-breakdown-dialog";
import { PublicJobDetailActions } from "./public-job-detail-actions";
import { JobDetailPresentation } from "../shared/job-detail-presentation";
import type { PublicJob } from "./public-job-types";

function dateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  }).format(date);
}
export function PublicJobDetailContent({
  job, configured, dismissed, applyUrl, sourceUrl, signInUrl, onDismiss, onRestore,
}: {
  job: PublicJob; configured: boolean; dismissed: boolean; applyUrl: string | null;
  sourceUrl: string | null; signInUrl: string; onDismiss?: () => void; onRestore?: () => void;
}) {
  const [matchOpen, setMatchOpen] = useState(false);
  const source = Array.isArray(job.job_sources) ? job.job_sources[0] : job.job_sources;
  const matchAction = <Stack direction="row" spacing={1} alignItems="center">
    {configured ? <>
      <Show when="signed-in">
        <Button variant="outlined" size="small" onClick={() => setMatchOpen(true)} startIcon={<UserRoundSearch size={16} />}>Profile match —</Button>
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
          <Button variant="outlined" size="small" startIcon={<UserRoundSearch size={16} />}>Check profile match</Button>
        </SignInButton>
      </Show>
    </> : <Button component="a" href={signInUrl} size="small" variant="outlined">Check profile match</Button>}
    <PublicJobDetailActions configured={configured} applyUrl={applyUrl} signInUrl={signInUrl}
      dismissed={dismissed} onDismiss={onDismiss} onRestore={onRestore} placement="header" />
  </Stack>;
  return <>
    <JobDetailPresentation job={job} postedAt={source?.published_at || job.updated_at}
      formatDate={dateLabel} headingAction={matchAction}
      actions={<PublicJobDetailActions configured={configured} applyUrl={applyUrl} signInUrl={signInUrl}
        dismissed={dismissed} onDismiss={onDismiss} onRestore={onRestore} placement="primary" />}
      afterDescription={sourceUrl ? <Button component="a" href={sourceUrl} target="_blank"
        rel="noopener noreferrer" variant="text" size="small">View original listing <ExternalLink size={13} /></Button> : null} />
    <MatchBreakdownDialog open={matchOpen} onClose={() => setMatchOpen(false)} />
  </>;
}
