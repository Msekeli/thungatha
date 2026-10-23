"use client";

import type { ReactNode, RefObject } from "react";
import { AuthenticatedJobResultsPanel } from "../authenticated/job-results-panel";
import { AuthenticatedJobDetailPanel } from "../authenticated/job-detail-panel";
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
  onDismissJob: (job: Job) => void;
  onBack: () => void;
  onViewMatch: (anchorEl: HTMLElement) => void;
  onApply: (anchorEl: HTMLElement) => void;
  onSave: () => void;
  onDismiss: () => void;
  onRetryDetail: () => void;
  configured: boolean;
  sortOrder: string;
  onSortChange: (value: string) => void;
  leadingColumn?: ReactNode;
};

export function JobDiscoveryWorkspace(props: Props) {
  const hasLeadingColumn = Boolean(props.leadingColumn);
  return (
    <div
      className={[
        "th-jobs-workspace th-jobs-redesign-workspace grid min-h-0 w-full gap-4",
        hasLeadingColumn
          ? "h-full max-h-full grid-cols-[minmax(0,15%)_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden"
          : "h-[min(72dvh,900px)] max-h-[calc(100dvh-12rem)] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
      ].join(" ")}
    >
      {props.leadingColumn}
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
        onDismiss={props.onDismissJob}
        configured={props.configured}
        sortOrder={props.sortOrder}
        onSortChange={props.onSortChange}
      />
      <AuthenticatedJobDetailPanel
        configured={props.configured}
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
    </div>
  );
}
