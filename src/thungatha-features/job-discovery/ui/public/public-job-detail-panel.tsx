"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { PublicJobDetailContent } from "./public-job-detail-content";
import { JobDetailEmptyState } from "../shared/job-detail-presentation";
import type {
  PublicJob,
  PublicJobDetailPanelProps,
  PublicJobSource,
} from "./public-job-types";
export type { PublicJob, PublicJobSource } from "./public-job-types";
function safeUrl(value: string | null | undefined): string | null {
  try {
    const url = new URL(value || "");
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}
function sourceFor(job: PublicJob): PublicJobSource | null {
  if (!job.job_sources) return null;
  return Array.isArray(job.job_sources)
    ? (job.job_sources[0] ?? null)
    : job.job_sources;
}
export function PublicJobDetailPanel({
  job,
  configured,
  mobileOpen,
  dismissed = false,
  onDismiss,
  onRestore,
  onBack,
}: PublicJobDetailPanelProps) {
  const source = job ? sourceFor(job) : null;
  const applicationUrl = safeUrl(source?.application_url);
  const sourceUrl = safeUrl(source?.source_url);
  const applyUrl = applicationUrl ?? sourceUrl;
  const signIn = "/sign-in";
  return (
    <Box
      component="aside"
      className={`th-discovery-detail th-jobs-redesign-detail ${mobileOpen ? "th-detail-mobile-open" : ""}`}
      aria-label="Selected job details"
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        "& .th-jobs-detail-actions": {
          display: "flex",
          flexDirection: "column",
          gap: 1,
        },
        "& .th-no-apply": { color: "text.secondary" },
        "@media (max-width: 760px)": {
          height: "auto",
          maxHeight: "none",
          overflow: "hidden",
          p: 1.25,
        },
      }}
    >
      {job ? (
        <PublicJobDetailContent
          job={job}
          configured={configured}
          dismissed={dismissed}
          applyUrl={applyUrl}
          sourceUrl={sourceUrl}
          signInUrl={signIn}
          onDismiss={onDismiss}
          onRestore={onRestore}
        />
      ) : (
        <JobDetailEmptyState />
      )}
    </Box>
  );
}
