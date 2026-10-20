"use client";

import Box from "@mui/material/Box";
import { AuthenticatedJobDetailContent } from "./job-detail-content";
import type { JobDetailContentProps } from "./job-detail-types";
type Props = JobDetailContentProps & { mobileDetail: boolean };

export function AuthenticatedJobDetailPanel({
  configured,
  job,
  source,
  applicationDestination,
  applicationUrl,
  jobSourceUrl,
  busy,
  detailLoading,
  mobileDetail,
  activityError,
  detailError,
  formatDate,
  onBack,
  onViewMatch,
  onApply,
  onSave,
  onDismiss,
  onRetry,
}: Props) {
  return (
    <Box
      component="section"
      className={`th-jobs-detail-panel th-jobs-redesign-detail ${mobileDetail ? "th-jobs-mobile-visible" : ""}`}
      aria-label="Selected job details"
      aria-busy={detailLoading}
      sx={{
        position: "sticky",
        top: 1.5,
        alignSelf: "start",
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        maxHeight: "calc(100dvh - var(--th-app-header-height, 72px) - 42px)",
        overflowY: "auto",
        p: 2.5,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        "& > .th-jobs-detail-content": {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          p: 0,
          overflow: "hidden",
          overflowY: "auto",
        },
        "@media (max-width: 1100px) and (min-width: 761px)": {
          maxHeight: "calc(100dvh - var(--th-app-header-height, 72px) - 42px)",
          p: 2,
        },
        "@media (max-width: 760px)": {
          position: "static",
          height: "auto",
          maxHeight: "none",
          p: 1.75,
          borderRadius: 1.75,
          boxShadow: "none",
          "& > .th-jobs-detail-content": { overflow: "visible" },
        },
      }}
    >
      <AuthenticatedJobDetailContent
        configured={configured}
        job={job}
        source={source}
        applicationDestination={applicationDestination}
        applicationUrl={applicationUrl}
        jobSourceUrl={jobSourceUrl}
        busy={busy}
        detailLoading={detailLoading}
        activityError={activityError}
        detailError={detailError}
        formatDate={formatDate}
        onBack={onBack}
        onViewMatch={onViewMatch}
        onApply={onApply}
        onSave={onSave}
        onDismiss={onDismiss}
        onRetry={onRetry}
      />
    </Box>
  );
}
