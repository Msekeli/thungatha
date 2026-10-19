"use client";

import Link from "next/link";
import { Button, Stack } from "@mui/material";
import { Bookmark, Check, EyeOff, ExternalLink, PanelsTopLeft } from "lucide-react";

type JobState = "saved" | "dismissed" | null;
type Job = { id: string; title: string; state: JobState };
type Props = {
  job: Job;
  applicationDestination: string | null;
  applicationUrl: string | null;
  jobSourceUrl: string | null;
  busy: boolean;
  detailLoading: boolean;
  onApply: () => void;
  onSave: () => void;
  onDismiss: () => void;
};

export function JobDetailActions({ job, applicationDestination, applicationUrl, jobSourceUrl, busy, detailLoading, onApply, onSave, onDismiss }: Props) {
  const disabled = busy || detailLoading;
  const applyTitle = applicationUrl
    ? "Opens the supplied application destination"
    : jobSourceUrl
      ? "Opens the available source listing; it may not be the employer application page"
      : "No job or application link is available";

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
      <Button variant="contained" disabled={!applicationDestination || disabled} title={applyTitle}
        onClick={onApply} startIcon={<ExternalLink size={14} />}>
        {applicationUrl ? "Apply on company site" : "Open job listing"}
      </Button>
      <Button component={Link} href={`/cv-studio?jobId=${encodeURIComponent(job.id)}`} variant="outlined"
        startIcon={<PanelsTopLeft size={14} />}>Tailor my CV</Button>
      <Button variant="outlined" disabled={disabled} onClick={onSave}
        startIcon={job.state === "saved" ? <Check size={14} /> : <Bookmark size={14} />}>
        {job.state === "saved" ? "Saved" : "Save"}
      </Button>
      <Button variant="outlined" color="warning" disabled={disabled} onClick={onDismiss}
        startIcon={job.state === "dismissed" ? undefined : <EyeOff size={14} />}>
        {job.state === "dismissed" ? "Restore" : "Dismiss"}
      </Button>
    </Stack>
  );
}
