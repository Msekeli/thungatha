import { useEffect } from "react";
import { useJobActivitySync } from "./use-job-activity-sync";
import { useUpdateJobState } from "./use-update-job-state";
import { useSelectedJobDetail } from "./use-selected-job-detail";
import { useUndoJobState } from "./use-undo-job-state";
import { useJobFeed } from "./use-job-feed";
import type { useJobDiscoveryState } from "./use-job-discovery-state";

type DiscoveryState = ReturnType<typeof useJobDiscoveryState>;

export function useJobDiscoveryData(
  state: DiscoveryState,
  userId: string | null,
  enabled: boolean,
  activeCategory: string,
) {
  const s = state;
  const { undoAction, setUndoAction } = state;
  useJobFeed(
    userId,
    enabled,
    s.page,
    activeCategory,
    s.filters,
    s.sortOrder,
    s.retryFeed,
    s.setFeed,
    s.setDismissedCount,
    s.setLoading,
    s.setError,
    s.setIsAuthenticated,
    s.setSelectedId,
  );
  useSelectedJobDetail(
    s.selectedId,
    s.retryDetail,
    s.setDetail,
    s.setDetailLoading,
    s.setDetailError,
  );
  useJobActivitySync(
    s.userSignedIn,
    s.selectedId,
    s.setJobActivity,
    s.setActivityError,
    s.setForceAppliedPrompt,
    s.setDismissedPromptForJobId,
  );
  const updateJobState = useUpdateJobState(
    s.stateBusy,
    s.setStateBusy,
    s.setStateError,
    s.setStateMessage,
    s.setFeed,
    s.setDetail,
    s.setSelectedId,
    s.setUndoAction,
    s.setRetryFeed,
  );
  const undoLastStateChange = useUndoJobState(
    s.undoAction,
    s.stateBusy,
    s.detail,
    s.feed,
    updateJobState,
    s.setUndoAction,
    s.setStateMessage,
  );
  useEffect(() => {
    if (!undoAction) return;
    const timeoutId = window.setTimeout(() => setUndoAction(null), 10_000);
    return () => window.clearTimeout(timeoutId);
  }, [undoAction, setUndoAction]);
  return { updateJobState, undoLastStateChange };
}
