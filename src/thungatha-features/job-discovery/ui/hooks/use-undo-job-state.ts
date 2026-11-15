"use client";

import { useCallback } from "react";
import type { Job } from "../job-discovery-utils";

type UndoAction = {
  jobId: string;
  title: string;
  previousState: "saved" | "dismissed" | null;
  nextState: "saved" | "dismissed" | null;
};

export function useUndoJobState(
  undoAction: UndoAction | null,
  stateBusy: boolean,
  detail: Job | null,
  feed: { jobs: Job[] } | null,
  updateJobState: (
    job: Job,
    state: "saved" | "dismissed" | null,
    recordUndo?: boolean,
  ) => Promise<boolean>,
  setUndoAction: (value: UndoAction | null) => void,
  setStateMessage: (value: string | null) => void,
) {
  return useCallback(async () => {
    if (!undoAction || stateBusy) return;
    const existingJob =
      detail?.id === undoAction.jobId
        ? detail
        : feed?.jobs.find((item) => item.id === undoAction.jobId);

    if (!existingJob) {
      setStateMessage("This opportunity is no longer available to restore.");
      setUndoAction(null);
      return;
    }

    const job: Job = { ...existingJob, state: undoAction.nextState };
    if (await updateJobState(job, undoAction.previousState, false)) {
      setUndoAction(null);
      setStateMessage(
        undoAction.previousState === "saved"
          ? "Previous saved state restored."
          : undoAction.previousState === "dismissed"
            ? "Previous dismissed state restored."
            : "Job decision undone.",
      );
    }
  }, [
    undoAction,
    stateBusy,
    detail,
    feed,
    updateJobState,
    setUndoAction,
    setStateMessage,
  ]);
}
