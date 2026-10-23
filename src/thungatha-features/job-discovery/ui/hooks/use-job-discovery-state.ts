import { useRef, useState } from "react";
import {
  EMPTY_FILTERS,
  type Feed,
  type Filters,
  type Job,
  type JobActivity,
} from "../job-discovery-utils";

export function useJobDiscoveryState(
  showProfileSetupPrompt: boolean,
  isSignedIn: boolean,
) {
  const [profileSetupPrompt, setProfileSetupPrompt] = useState(
    showProfileSetupPrompt,
  );
  const [profileSetupAnchorEl, setProfileSetupAnchorEl] =
    useState<HTMLElement | null>(null);
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
  const [userSignedIn, setUserSignedIn] = useState(isSignedIn);
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
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchAnchorEl, setMatchAnchorEl] = useState<HTMLElement | null>(null);
  const [applicationPromptAnchorEl, setApplicationPromptAnchorEl] =
    useState<HTMLElement | null>(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  return {
    profileSetupPrompt,
    setProfileSetupPrompt,
    profileSetupAnchorEl,
    setProfileSetupAnchorEl,
    draft,
    setDraft,
    filters,
    setFilters,
    page,
    setPage,
    feed,
    setFeed,
    loading,
    setLoading,
    error,
    setError,
    retryFeed,
    setRetryFeed,
    selectedId,
    setSelectedId,
    detail,
    setDetail,
    detailLoading,
    setDetailLoading,
    detailError,
    setDetailError,
    retryDetail,
    setRetryDetail,
    mobileDetail,
    setMobileDetail,
    category,
    setCategory,
    isAuthenticated,
    setIsAuthenticated,
    userSignedIn,
    setUserSignedIn,
    stateBusy,
    setStateBusy,
    stateError,
    setStateError,
    stateMessage,
    setStateMessage,
    undoAction,
    setUndoAction,
    jobActivity,
    setJobActivity,
    activityError,
    setActivityError,
    forceAppliedPrompt,
    setForceAppliedPrompt,
    dismissedPromptForJobId,
    setDismissedPromptForJobId,
    filtersOpen,
    setFiltersOpen,
    filterAnchorEl,
    setFilterAnchorEl,
    matchOpen,
    setMatchOpen,
    matchAnchorEl,
    setMatchAnchorEl,
    applicationPromptAnchorEl,
    setApplicationPromptAnchorEl,
    sortOrder,
    setSortOrder,
    loadMoreRef,
  };
}
