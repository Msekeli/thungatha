import { useEffect } from "react";
import { useJobActivitySync } from "./use-job-activity-sync";
import { useInfiniteJobPagination } from "./use-infinite-job-pagination";
import { useUpdateJobState } from "./use-update-job-state";
import { useSelectedJobDetail } from "./use-selected-job-detail";
import { useUndoJobState } from "./use-undo-job-state";
import { useJobFeed } from "./use-job-feed";
import type { Feed, Job } from "../job-discovery-utils";

type UndoAction = { jobId: string; title: string; previousState: "saved" | "dismissed" | null; nextState: "saved" | "dismissed" | null } | null;

export function useJobDiscoveryData(state: {
  page: number; category: string; filters: { query: string; location: string; employmentType: string; workplaceType: string; experienceLevel: string };
  retryFeed: number; setFeed: (value: Feed | null) => void; setLoading: (value: boolean) => void;
  setError: (value: string | null) => void; setIsAuthenticated: (value: boolean) => void;
  setSelectedId: (value: string | null) => void; loadMoreRef: React.RefObject<HTMLDivElement | null>;
  loading: boolean; feed: Feed | null; setPage: (value: number) => void;
  selectedId: string | null; retryDetail: number; setDetail: (value: Job | null) => void;
  setDetailLoading: (value: boolean) => void; setDetailError: (value: string | null) => void;
  setJobActivity: (value: { jobId: string; activity: import("../job-discovery-utils").JobActivity } | null) => void;
  setActivityError: (value: string | null) => void; setForceAppliedPrompt: (value: boolean) => void;
  setDismissedPromptForJobId: (value: string | null) => void; stateBusy: boolean;
  setStateBusy: (value: boolean) => void; setStateError: (value: string | null) => void;
  setStateMessage: (value: string | null) => void; setUndoAction: (value: UndoAction) => void;
  undoAction: UndoAction; detail: Job | null;
}) {
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
