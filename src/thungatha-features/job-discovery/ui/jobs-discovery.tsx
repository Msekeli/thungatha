"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./jobs-discovery.css";
import { AuthenticatedJobResultsPanel } from "./authenticated/job-results-panel";
import { JobDiscoveryHeader } from "./authenticated/job-discovery-header";
import { ProfileSetupDialog } from "./authenticated/profile-setup-dialog";
import { MatchBreakdownDialog } from "./authenticated/match-breakdown-dialog";
import { ApplicationConfirmationDialog } from "./authenticated/application-confirmation-dialog";
import { JobFiltersDialog } from "./authenticated/job-filters-dialog";
import { AuthenticatedJobDetailPanel } from "./authenticated/job-detail-panel";
import { JobUndoNotice } from "./authenticated/job-undo-notice";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Toast } from "@/components/ui/toast";
import { useJobActivitySync } from "./hooks/use-job-activity-sync";
import { useInfiniteJobPagination } from "./hooks/use-infinite-job-pagination";
import { useUpdateJobState } from "./hooks/use-update-job-state";
import { useJobApplicationActions } from "./hooks/use-job-application-actions";
import { useSelectedJobDetail } from "./hooks/use-selected-job-detail";
import { useUndoJobState } from "./hooks/use-undo-job-state";
import { useJobFilterActions } from "./hooks/use-job-filter-actions";
import { useJobFeed } from "./hooks/use-job-feed";
import { buildJobDiscoveryViewModel } from "./job-discovery-view-model";

import {
  EMPTY_FILTERS,
  formatDate,
  shown,
  sourceFor,
  type Feed,
  type Filters,
  type Job,
  type JobActivity,
} from "./job-discovery-utils";

export default function JobsDiscovery({
  configured,
  showProfileSetupPrompt = false,
}: {
  configured: boolean;
  showProfileSetupPrompt?: boolean;
}) {
  const router = useRouter();
  const [profileSetupPrompt, setProfileSetupPrompt] = useState(
    showProfileSetupPrompt,
  );
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryFeed, setRetryFeed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Job | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [retryDetail, setRetryDetail] = useState(0);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [category, setCategory] = useState("new");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [stateBusy, setStateBusy] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [stateMessage, setStateMessage] = useState<string | null>(null);
  const [undoAction, setUndoAction] = useState<{
    jobId: string;
    title: string;
    previousState: "saved" | "dismissed" | null;
    nextState: "saved" | "dismissed" | null;
  } | null>(null);
  const [jobActivity, setJobActivity] = useState<{
    jobId: string;
    activity: JobActivity;
  } | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [forceAppliedPrompt, setForceAppliedPrompt] = useState(false);
  const [dismissedPromptForJobId, setDismissedPromptForJobId] = useState<
    string | null
  >(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showProfileSetupPrompt) return;
    // Remove the one-time prompt flag without triggering a Next.js RSC navigation.
    window.history.replaceState(null, "", "/jobs");
  }, [showProfileSetupPrompt]);

  useJobFeed(
    page, category, filters, retryFeed, setFeed, setLoading, setError,
    setIsAuthenticated, setSelectedId,
  );

  useInfiniteJobPagination(loadMoreRef, loading, feed, page, setPage);

  useSelectedJobDetail(
    selectedId,
    retryDetail,
    setDetail,
    setDetailLoading,
    setDetailError,
  );

  useJobActivitySync(
    selectedId,
    setJobActivity,
    setActivityError,
    setForceAppliedPrompt,
    setDismissedPromptForJobId,
  );

  const updateJobState = useUpdateJobState(
    stateBusy,
    setStateBusy,
    setStateError,
    setStateMessage,
    setFeed,
    setDetail,
    setUndoAction,
    setRetryFeed,
  );

  const undoLastStateChange = useUndoJobState(
    undoAction,
    stateBusy,
    detail,
    feed,
    updateJobState,
    setUndoAction,
    setStateMessage,
  );

  useEffect(() => {
    if (!undoAction) return;
    const timeoutId = window.setTimeout(() => setUndoAction(null), 10_000);
    return () => window.clearTimeout(timeoutId);
  }, [undoAction]);

  const view = buildJobDiscoveryViewModel({
    detail, selectedId, feed, jobActivity, filters, sortOrder,
  });
  const {
    selectedDetail, selectedSource, selectedActivity, applicationUrl,
    jobSourceUrl, applicationDestination, hasFilters, visibleJobs, categories,
  } = view;

  const { openApplicationLink, confirmApplied } = useJobApplicationActions(
    selectedDetail,
    stateBusy,
    setStateBusy,
    setStateError,
    setStateMessage,
    setJobActivity,
    setForceAppliedPrompt,
    setDismissedPromptForJobId,
    setRetryFeed,
  );

  const { changeDraft, submitFilters, clearFilters } = useJobFilterActions(
    draft, setDraft, setFilters, setPage, setMobileDetail,
  );
  return (
    <WorkspaceShell active="/jobs" configured={configured}>
      <main className="th-jobs-page th-jobs-redesign">
        {!isAuthenticated && (
          <div className="th-jobs-auth-notice" role="status">
            <p>
              Your session has expired. Sign in again to browse job listings.
            </p>
            <Link href="/sign-in">Go to sign in</Link>
          </div>
        )}
        <JobDiscoveryHeader
          draft={draft}
          filtersOpen={filtersOpen}
          categories={categories}
          category={category}
          sortOrder={sortOrder}
          onQueryChange={(value) => changeDraft("query", value)}
          onLocationChange={(value) => changeDraft("location", value)}
          onSubmit={submitFilters}
          onToggleFilters={() => setFiltersOpen((value) => !value)}
          onSortChange={setSortOrder}
          onCategoryChange={(key, label) => {
            if (key === "all" || key === "saved" || key === "dismissed") {
              setCategory(key === "all" ? "new" : key);
              setPage(1);
              return;
            }
            changeDraft("employmentType", label);
            setFilters((current) => ({ ...current, employmentType: label }));
            setPage(1);
          }}
        />
        {undoAction && (
          <JobUndoNotice
            action={undoAction}
            busy={stateBusy}
            onUndo={() => void undoLastStateChange()}
            onDismiss={() => setUndoAction(null)}
          />
        )}
        {stateMessage && !undoAction && (
          <Toast
            message={stateMessage}
            tone="success"
            onDismiss={() => setStateMessage(null)}
          />
        )}
        {stateError && (
          <Toast
            message={stateError}
            tone="error"
            onDismiss={() => setStateError(null)}
          />
        )}
        <div className="th-jobs-workspace th-jobs-redesign-workspace">
          <AuthenticatedJobResultsPanel
            jobs={visibleJobs}
            feed={feed}
            loading={loading}
            error={error}
            hasFilters={hasFilters}
            mobileDetail={mobileDetail}
            selectedId={selectedId}
            loadMoreRef={loadMoreRef}
            sourceFor={sourceFor}
            formatDate={formatDate}
            onRetry={() => setRetryFeed((v) => v + 1)}
            onSelect={(job) => {
              setSelectedId(job.id);
              setForceAppliedPrompt(false);
              setDismissedPromptForJobId(null);
              setActivityError(null);
              setMobileDetail(true);
            }}
          />
          <AuthenticatedJobDetailPanel
            job={selectedDetail}
            source={selectedSource}
            applicationDestination={applicationDestination}
            applicationUrl={applicationUrl}
            jobSourceUrl={jobSourceUrl}
            busy={stateBusy}
            detailLoading={detailLoading}
            mobileDetail={mobileDetail}
            activityError={activityError}
            detailError={detailError}
            formatDate={formatDate}
            onBack={() => setMobileDetail(false)}
            onViewMatch={() => setMatchOpen(true)}
            onApply={() => applicationDestination && openApplicationLink(selectedDetail!, applicationDestination)}
            onSave={() => selectedDetail && void updateJobState(selectedDetail, selectedDetail.state === "saved" ? null : "saved")}
            onDismiss={() => selectedDetail && void updateJobState(selectedDetail, selectedDetail.state === "dismissed" ? null : "dismissed")}
            onRetry={() => setRetryDetail((v) => v + 1)}
          />
        </div>
        <JobFiltersDialog
          open={filtersOpen}
          draft={draft}
          onClose={() => setFiltersOpen(false)}
          onChange={changeDraft}
          onReset={clearFilters}
          onApply={() => { setFilters({ ...draft }); setPage(1); setMobileDetail(false); setFiltersOpen(false); }}
        />
        <ProfileSetupDialog
          open={profileSetupPrompt}
          onClose={() => setProfileSetupPrompt(false)}
          onCreateProfile={() => router.push("/profile")}
        />
        <MatchBreakdownDialog
          open={matchOpen}
          onClose={() => setMatchOpen(false)}
        />
        <ApplicationConfirmationDialog
          open={Boolean(
            selectedDetail &&
            (forceAppliedPrompt ||
              (Boolean(selectedActivity?.application_link_opened_at) &&
                !selectedActivity?.applied_at &&
                dismissedPromptForJobId !== selectedId)),
          )}
          busy={stateBusy}
          jobTitle={selectedDetail?.title ?? ""}
          employer={shown(selectedDetail?.employer_name)}
          onClose={() => {
            setForceAppliedPrompt(false);
            if (selectedDetail) setDismissedPromptForJobId(selectedDetail.id);
          }}
          onConfirm={() => void confirmApplied()}
        />
      </main>
    </WorkspaceShell>
  );
}
