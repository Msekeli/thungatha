"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./jobs-discovery.css";
import { useJobDiscoveryState } from "./hooks/use-job-discovery-state";
import { useJobDiscoveryController } from "./hooks/use-job-discovery-controller";
import { JobDiscoveryScreen } from "./authenticated/job-discovery-screen";


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

  const state = useJobDiscoveryState(showProfileSetupPrompt);
  const controller = useJobDiscoveryController(state);
  const {
    updateJobState, undoLastStateChange, selectedDetail, selectedSource,
    selectedActivity, applicationUrl, jobSourceUrl, applicationDestination,
    hasFilters, visibleJobs, categories, openApplicationLink, confirmApplied,
    changeDraft, submitFilters, clearFilters,
  } = controller;

  return <JobDiscoveryScreen configured={configured} state={state} controller={controller} routerPushProfile={() => router.push("/profile")} />;
}
