"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { JobList } from "../shared/job-list";
import type { JobCardData } from "../shared/job-card";

type JobListItem = { job: JobCardData; postedLabel: string };
type Props = {
  jobs: JobListItem[];
  selectedId: string | null;
  configured: boolean;
  onSelect: (jobId: string) => void;
};

export function PublicJobDiscoveryJobList({ jobs, selectedId, configured, onSelect }: Props) {
  const jobData = jobs.map(({ job }) => job);
  const postedById = new Map(jobs.map(({ job, postedLabel }) => [job.id, postedLabel]));
  return <div className="th-job-list">
    <JobList jobs={jobData} variant="public" selectedId={selectedId}
      postedLabel={(job) => postedById.get(job.id) ?? "Date unknown"}
      onSelect={(job) => onSelect(job.id)}
      saveAction={(job) => configured ? (
        <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
          <Button variant="ghost" size="sm" type="button" aria-label={`Sign in to save ${job.title}`} title="Sign in to save this job">
            <Bookmark size={16} />
          </Button>
        </SignInButton>
      ) : (
        <Link className="th-job-card-save-link" href="/sign-in" aria-label={`Sign in to save ${job.title}`} title="Sign in to save this job">
          <Bookmark size={16} />
        </Link>
      )} />
  </div>;
}
