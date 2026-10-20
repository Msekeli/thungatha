"use client";

import { Button, Stack } from "@mui/material";
import { ExternalLink } from "lucide-react";
import { JobDetailProtectedActions } from "./job-detail-protected-actions";

type JobState = "saved" | "dismissed" | null;
type Job = { id: string; title: string; state: JobState };
type Props = {
  configured: boolean;
  job: Job;
  applicationDestination: string | null;
  applicationUrl: string | null;
  jobSourceUrl: string | null;
  busy: boolean;
  detailLoading: boolean;
  onApply: (anchorEl: HTMLElement) => void;
  onSave: () => void;
  onDismiss: () => void;
};

export function JobDetailActions({
  configured,
  job,
  applicationDestination,
  applicationUrl,
  jobSourceUrl,
  busy,
  detailLoading,
  onApply,
  onSave,
  onDismiss,
}: Props) {
  const disabled = busy || detailLoading;
  const applyTitle = applicationUrl
    ? "Opens the supplied application destination"
    : jobSourceUrl
      ? "Opens the available source listing; it may not be the employer application page"
      : "No job or application link is available";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
    >
      <Button
        variant="contained"
        disabled={!applicationDestination || disabled}
        title={applyTitle}
        data-job-application-trigger
        onClick={(event) => onApply(event.currentTarget)}
        startIcon={<ExternalLink size={14} />}
      >
        {applicationUrl ? "Apply on company site" : "Open job listing"}
      </Button>
      <JobDetailProtectedActions
        configured={configured}
        job={job}
        disabled={disabled}
        onSave={onSave}
        onDismiss={onDismiss}
      />
    </Stack>
  );
}
