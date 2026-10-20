"use client";

import type { RefObject } from "react";
import Box from "@mui/material/Box";
import { AuthenticatedJobResultsPanel } from "./job-results-panel";
import { AuthenticatedJobDetailPanel } from "./job-detail-panel";
import { sourceFor, type Feed, type Job } from "../job-discovery-utils";

type Props = {
  jobs: Job[];
  feed: Feed | null;
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  mobileDetail: boolean;
  selectedId: string | null;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  selectedDetail: Job | null;
  selectedSource: ReturnType<typeof sourceFor>;
  applicationDestination: string | null;
  applicationUrl: string | null;
  jobSourceUrl: string | null;
  busy: boolean;
  detailLoading: boolean;
  activityError: string | null;
  detailError: string | null;
  sourceFor: typeof sourceFor;
  formatDate: (value: string | null | undefined) => string | null;
  onRetryFeed: () => void;
  onSelect: (job: Job) => void;
  onSaveJob: (job: Job) => void;
  onBack: () => void;
  onViewMatch: (anchorEl: HTMLElement) => void;
  onApply: (anchorEl: HTMLElement) => void;
  onSave: () => void;
  onDismiss: () => void;
  onRetryDetail: () => void;
};

export function AuthenticatedJobWorkspace(props: Props) {
  return (
    <Box
      className="th-jobs-workspace th-jobs-redesign-workspace"
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(340px, 0.92fr) minmax(0, 1.08fr)",
        gap: 2.25,
        alignItems: "stretch",
        minHeight: 0,
        "& > *": { minWidth: 0 },
        "@media (max-width: 1100px) and (min-width: 761px)": {
          gridTemplateColumns: "minmax(280px, 0.9fr) minmax(0, 1.1fr)",
          gap: 1.5,
        },
        "@media (max-width: 760px)": { display: "block", overflow: "visible" },
      }}
    >
      <AuthenticatedJobResultsPanel
        jobs={props.jobs}
        feed={props.feed}
        loading={props.loading}
        error={props.error}
        hasFilters={props.hasFilters}
        mobileDetail={props.mobileDetail}
        selectedId={props.selectedId}
        loadMoreRef={props.loadMoreRef}
        sourceFor={props.sourceFor}
        formatDate={props.formatDate}
        onRetry={props.onRetryFeed}
        onSelect={props.onSelect}
        onSave={props.onSaveJob}
      />
      <AuthenticatedJobDetailPanel
        job={props.selectedDetail}
        source={props.selectedSource}
        applicationDestination={props.applicationDestination}
        applicationUrl={props.applicationUrl}
        jobSourceUrl={props.jobSourceUrl}
        busy={props.busy}
        detailLoading={props.detailLoading}
        mobileDetail={props.mobileDetail}
        activityError={props.activityError}
        detailError={props.detailError}
        formatDate={props.formatDate}
        onBack={props.onBack}
        onViewMatch={props.onViewMatch}
        onApply={props.onApply}
        onSave={props.onSave}
        onDismiss={props.onDismiss}
        onRetry={props.onRetryDetail}
      />
    </Box>
  );
}
