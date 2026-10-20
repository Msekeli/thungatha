"use client";
import { Bookmark, EyeOff, RotateCcw } from "lucide-react";
import Box from "@mui/material/Box";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { JobList } from "../shared/job-list";
import type { JobCardData } from "../shared/job-card";
import { PublicAuthPrompt } from "./public-auth-prompt";

type JobListItem = { job: JobCardData; postedLabel: string };
type Props = {
  jobs: JobListItem[];
  selectedId: string | null;
  configured: boolean;
  onSelect: (jobId: string) => void;
  dismissed?: boolean;
  onDismiss?: (jobId: string) => void;
  onRestore?: (jobId: string) => void;
};
export function PublicJobDiscoveryJobList({
  jobs,
  selectedId,
  configured,
  onSelect,
  dismissed = false,
  onDismiss,
  onRestore,
}: Props) {
  const jobData = jobs.map(({ job }) => job);
  const postedById = new Map(
    jobs.map(({ job, postedLabel }) => [job.id, postedLabel]),
  );
  return (
    <Box
      className="th-discovery-job-list"
      sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}
    >
      <JobList
        jobs={jobData}
        variant="public"
        selectedId={selectedId}
        postedLabel={(job) => postedById.get(job.id) ?? "Date unknown"}
        onSelect={(job) => onSelect(job.id)}
        saveAction={(job) => (
          <PublicAuthPrompt
            configured={configured}
            title={`Save ${job.title}`}
            description="Sign in or create a free account to save this opportunity and return to it later."
          >
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label={`Save ${job.title}`}
              title="Save this job"
            >
              <Bookmark size={16} />
            </Button>
          </PublicAuthPrompt>
        )}
        secondaryAction={(job) =>
          dismissed ? (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label={`Restore ${job.title}`}
              title="Restore job"
              onClick={() => onRestore?.(job.id)}
            >
              <RotateCcw size={15} />
            </Button>
          ) : configured ? (
            <>
              <Show when="signed-in">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  aria-label={`Dismiss ${job.title}`}
                  title="Dismiss job"
                  onClick={() => onDismiss?.(job.id)}
                >
                  <EyeOff size={15} />
                </Button>
              </Show>
              <Show when="signed-out">
                <PublicAuthPrompt
                  configured
                  title="Personalise your job feed"
                  description="Sign in or create a free account to dismiss jobs you are not interested in."
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    aria-label={`Sign in to dismiss ${job.title}`}
                    title="Dismiss job"
                  >
                    <EyeOff size={15} />
                  </Button>
                </PublicAuthPrompt>
              </Show>
            </>
          ) : (
            <PublicAuthPrompt
              configured={false}
              title="Personalise your job feed"
              description="Create an account or sign in to dismiss jobs you are not interested in."
            >
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-label={`Dismiss ${job.title}`}
                title="Dismiss job"
              >
                <EyeOff size={15} />
              </Button>
            </PublicAuthPrompt>
          )
        }
      />
    </Box>
  );
}
