"use client";

import type { RefObject } from "react";
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
  onBack: () => void;
  onViewMatch: () => void;
  onApply: () => void;
  onSave: () => void;
  onDismiss: () => void;
  onRetryDetail: () => void;
};

export function AuthenticatedJobWorkspace(props: Props) {
  return (
    <div className="th-jobs-workspace th-jobs-redesign-workspace">
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
    </div>
  );
}
