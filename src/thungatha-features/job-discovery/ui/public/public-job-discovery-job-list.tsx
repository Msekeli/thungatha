"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { JobCard, type JobCardData } from "../shared/job-card";

type JobListItem = { job: JobCardData; postedLabel: string };
type Props = {
  jobs: JobListItem[];
  selectedId: string | null;
  configured: boolean;
  onSelect: (jobId: string) => void;
};

export function PublicJobDiscoveryJobList({ jobs, selectedId, configured, onSelect }: Props) {
  return (
    <div className="th-job-list">
      {jobs.map(({ job, postedLabel }) => (
        <JobCard
          key={job.id}
          job={job}
          variant="public"
          selected={selectedId === job.id}
          postedLabel={postedLabel}
          onSelect={() => onSelect(job.id)}
          saveAction={configured ? (
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="ghost" size="sm" type="button" aria-label={`Sign in to save ${job.title}`} title="Sign in to save this job">
                <Bookmark size={16} />
              </Button>
            </SignInButton>
          ) : (
            <Link className="th-job-card-save-link" href="/sign-in" aria-label={`Sign in to save ${job.title}`} title="Sign in to save this job"><Bookmark size={16} /></Link>
          )}
        />
      ))}
    </div>
  );
}
