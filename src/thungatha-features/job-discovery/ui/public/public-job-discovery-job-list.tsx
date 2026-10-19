"use client";
import { Bookmark, EyeOff, RotateCcw } from "lucide-react";
import Box from "@mui/material/Box";
import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { JobList } from "../shared/job-list";
import type { JobCardData } from "../shared/job-card";

type JobListItem = { job: JobCardData; postedLabel: string };
type Props = {
  jobs: JobListItem[]; selectedId: string | null; configured: boolean;
  onSelect: (jobId: string) => void; dismissed?: boolean;
  onDismiss?: (jobId: string) => void; onRestore?: (jobId: string) => void;
};
export function PublicJobDiscoveryJobList({
  jobs, selectedId, configured, onSelect, dismissed = false, onDismiss, onRestore,
}: Props) {
  const jobData = jobs.map(({ job }) => job);
  const postedById = new Map(jobs.map(({ job, postedLabel }) => [job.id, postedLabel]));
  return <Box className="th-discovery-job-list" sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
    <JobList jobs={jobData} variant="public" selectedId={selectedId}
      postedLabel={(job) => postedById.get(job.id) ?? "Date unknown"}
      onSelect={(job) => onSelect(job.id)}
      saveAction={(job) => configured ? (
        <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
          <Button variant="ghost" size="sm" type="button" aria-label={`Sign in to save ${job.title}`} title="Sign in to save this job"><Bookmark size={16} /></Button>
        </SignInButton>
      ) : <Link href="/sign-in" aria-label={`Sign in to save ${job.title}`} title="Sign in to save this job"><Bookmark size={16} /></Link>}
      secondaryAction={(job) => dismissed ? (
        <Button variant="ghost" size="sm" type="button" aria-label={`Restore ${job.title}`} title="Restore job" onClick={() => onRestore?.(job.id)}><RotateCcw size={15} /></Button>
      ) : configured ? <><Show when="signed-in"><Button variant="ghost" size="sm" type="button" aria-label={`Dismiss ${job.title}`} title="Dismiss job" onClick={() => onDismiss?.(job.id)}><EyeOff size={15} /></Button></Show>
        <Show when="signed-out"><SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1"><Button variant="ghost" size="sm" type="button" aria-label={`Sign in to dismiss ${job.title}`} title="Sign in to dismiss this job"><EyeOff size={15} /></Button></SignInButton></Show></>
        : <Link href="/sign-in" aria-label={`Sign in to dismiss ${job.title}`} title="Sign in to dismiss this job"><EyeOff size={15} /></Link>}
    />
  </Box>;
}
