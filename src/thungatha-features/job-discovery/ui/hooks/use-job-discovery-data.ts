import { useEffect } from "react";
import { useJobActivitySync } from "./use-job-activity-sync";
import { useInfiniteJobPagination } from "./use-infinite-job-pagination";
import { useUpdateJobState } from "./use-update-job-state";
import { useSelectedJobDetail } from "./use-selected-job-detail";
import { useUndoJobState } from "./use-undo-job-state";
import { useJobFeed } from "./use-job-feed";
import type { Feed, Job } from "../job-discovery-utils";
import type { useJobDiscoveryState } from "./use-job-discovery-state";

type UndoAction = { jobId: string; title: string; previousState: "saved" | "dismissed" | null; nextState: "saved" | "dismissed" | null } | null;

type DiscoveryState = ReturnType<typeof useJobDiscoveryState>;

export function useJobDiscoveryData(state: DiscoveryState) {
  const s = state;
  useJobFeed(s.page, s.category, s.filters, s.retryFeed, s.setFeed, s.setLoading, s.setError, s.setIsAuthenticated, s.setSelectedId);
  useInfiniteJobPagination(s.loadMoreRef, s.loading, s.feed, s.page, s.setPage);
  useSelectedJobDetail(s.selectedId, s.retryDetail, s.setDetail, s.setDetailLoading, s.setDetailError);
  useJobActivitySync(s.selectedId, s.setJobActivity, s.setActivityError, s.setForceAppliedPrompt, s.setDismissedPromptForJobId);
  const updateJobState = useUpdateJobState(s.stateBusy, s.setStateBusy, s.setStateError, s.setStateMessage, s.setFeed, s.setDetail, s.setUndoAction, s.setRetryFeed);
  const undoLastStateChange = useUndoJobState(s.undoAction, s.stateBusy, s.detail, s.feed, updateJobState, s.setUndoAction, s.setStateMessage);
  useEffect(() => {
    if (!s.undoAction) return;
    const timeoutId = window.setTimeout(() => s.setUndoAction(null), 10_000);
    return () => window.clearTimeout(timeoutId);
  }, [s.undoAction, s.setUndoAction]);
  return { updateJobState, undoLastStateChange };
}
