"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./jobs-discovery.css";
import { JobDiscoveryDialogs } from "./authenticated/job-discovery-dialogs";
import { AuthenticatedJobWorkspace } from "./authenticated/job-discovery-workspace";
import { JobDiscoveryControls } from "./authenticated/job-discovery-controls";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useJobDiscoveryState } from "./hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "./hooks/use-job-discovery-controller";

import { formatDate, shown, sourceFor } from "./job-discovery-utils";

export default function JobsDiscovery({
  configured,
  showProfileSetupPrompt = false,
}: {
  configured: boolean;
  showProfileSetupPrompt?: boolean;
}) {
  const router = useRouter();
  const {
    profileSetupPrompt, setProfileSetupPrompt, draft, setDraft, filters, setFilters,
    page, setPage, feed, setFeed, loading, setLoading, error, setError,
    retryFeed, setRetryFeed, selectedId, setSelectedId, detail, setDetail,
    detailLoading, setDetailLoading, detailError, setDetailError, retryDetail, setRetryDetail,
    mobileDetail, setMobileDetail, category, setCategory, isAuthenticated, setIsAuthenticated,
    stateBusy, setStateBusy, stateError, setStateError, stateMessage, setStateMessage,
    undoAction, setUndoAction, jobActivity, setJobActivity, activityError, setActivityError,
    forceAppliedPrompt, setForceAppliedPrompt, dismissedPromptForJobId, setDismissedPromptForJobId,
    filtersOpen, setFiltersOpen, matchOpen, setMatchOpen, sortOrder, setSortOrder, loadMoreRef,
  } = useJobDiscoveryState(showProfileSetupPrompt);

  useEffect(() => {
    if (!showProfileSetupPrompt) return;
    // Remove the one-time prompt flag without triggering a Next.js RSC navigation.
    window.history.replaceState(null, "", "/jobs");
  }, [showProfileSetupPrompt]);

  const controller = useJobDiscoveryController({
    ...useJobDiscoveryState(showProfileSetupPrompt),
  });
  const {
    updateJobState, undoLastStateChange, selectedDetail, selectedSource,
    selectedActivity, applicationUrl, jobSourceUrl, applicationDestination,
    hasFilters, visibleJobs, categories, openApplicationLink, confirmApplied,
    changeDraft, submitFilters, clearFilters,
  } = controller;

  return (
    <WorkspaceShell active="/jobs" configured={configured}>
      <main className="th-jobs-page th-jobs-redesign">
        <JobDiscoveryControls
          isAuthenticated={isAuthenticated}
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
          undoAction={undoAction}
          stateBusy={stateBusy}
          onUndo={() => void undoLastStateChange()}
          onDismissUndo={() => setUndoAction(null)}
          stateMessage={stateMessage}
          onDismissMessage={() => setStateMessage(null)}
          stateError={stateError}
          onDismissError={() => setStateError(null)}
        />
        <AuthenticatedJobWorkspace
          jobs={visibleJobs}
          feed={feed}
          loading={loading}
          error={error}
          hasFilters={hasFilters}
          mobileDetail={mobileDetail}
          selectedId={selectedId}
          loadMoreRef={loadMoreRef}
          selectedDetail={selectedDetail}
          selectedSource={selectedSource}
          applicationDestination={applicationDestination}
          applicationUrl={applicationUrl}
          jobSourceUrl={jobSourceUrl}
          busy={stateBusy}
          detailLoading={detailLoading}
          activityError={activityError}
          detailError={detailError}
          sourceFor={sourceFor}
          formatDate={formatDate}
          onRetryFeed={() => setRetryFeed((v) => v + 1)}
          onSelect={(job) => {
            setSelectedId(job.id);
            setForceAppliedPrompt(false);
            setDismissedPromptForJobId(null);
            setActivityError(null);
            setMobileDetail(true);
          }}
          onBack={() => setMobileDetail(false)}
          onViewMatch={() => setMatchOpen(true)}
          onApply={() => applicationDestination && openApplicationLink(selectedDetail!, applicationDestination)}
          onSave={() => selectedDetail && void updateJobState(selectedDetail, selectedDetail.state === "saved" ? null : "saved")}
          onDismiss={() => selectedDetail && void updateJobState(selectedDetail, selectedDetail.state === "dismissed" ? null : "dismissed")}
          onRetryDetail={() => setRetryDetail((v) => v + 1)}
        />
        <JobDiscoveryDialogs
          filtersOpen={filtersOpen}
          draft={draft}
          changeDraft={changeDraft}
          clearFilters={clearFilters}
          setFilters={setFilters}
          setPage={setPage}
          setMobileDetail={setMobileDetail}
          setFiltersOpen={setFiltersOpen}
          profileSetupPrompt={profileSetupPrompt}
          setProfileSetupPrompt={setProfileSetupPrompt}
          routerPushProfile={() => router.push("/profile")}
          matchOpen={matchOpen}
          setMatchOpen={setMatchOpen}
          showApplicationPrompt={Boolean(
            selectedDetail &&
            (forceAppliedPrompt ||
              (Boolean(selectedActivity?.application_link_opened_at) &&
                !selectedActivity?.applied_at &&
                dismissedPromptForJobId !== selectedId))
          )}
          stateBusy={stateBusy}
          jobTitle={selectedDetail?.title ?? ""}
          employer={shown(selectedDetail?.employer_name)}
          onCloseApplicationPrompt={() => {
            setForceAppliedPrompt(false);
            if (selectedDetail) setDismissedPromptForJobId(selectedDetail.id);
          }}
          onConfirmApplied={() => void confirmApplied()}
        />
      </main>
    </WorkspaceShell>
  );
}
