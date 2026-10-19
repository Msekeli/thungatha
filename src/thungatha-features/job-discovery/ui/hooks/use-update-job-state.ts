"use client";

import { useCallback } from "react";
import { getApiError, type Feed, type Job } from "../job-discovery-utils";

type SetValue<T> = (value: T | ((current: T) => T)) => void;

export function useUpdateJobState(
  stateBusy: boolean,
  setStateBusy: (value: boolean) => void,
  setStateError: (value: string | null) => void,
  setStateMessage: (value: string | null) => void,
  setFeed: SetValue<Feed | null>,
  setDetail: SetValue<Job | null>,
  setUndoAction: (value: { jobId: string; title: string; previousState: "saved" | "dismissed" | null; nextState: "saved" | "dismissed" | null } | null) => void,
  setRetryFeed: (value: (current: number) => number) => void,
) {
  return useCallback(async (
    job: Job,
    nextState: "saved" | "dismissed" | null,
    recordUndo = true,
  ): Promise<boolean> => {
    if (stateBusy) return false;
    const previousState = job.state ?? null;
    setStateBusy(true);
    setStateError(null);
    setStateMessage(null);
    try {
      const response = await fetch("/api/jobs/" + encodeURIComponent(job.id) + "/state", {
        method: nextState ? "PUT" : "DELETE",
        headers: {
          Accept: "application/json",
          ...(nextState ? { "Content-Type": "application/json" } : {}),
        },
        ...(nextState ? { body: JSON.stringify({ state: nextState }) } : {}),
        cache: "no-store",
      });
      if (!response.ok) {
        setStateError(await getApiError(response));
        return false;
      }
      setFeed((current) => current ? {
        ...current,
        jobs: current.jobs.map((item) => item.id === job.id
          ? { ...item, state: nextState } : item),
      } : current);
      setDetail((current) => current?.id === job.id
        ? { ...current, state: nextState } : current);
      if (recordUndo) setUndoAction({
        jobId: job.id, title: job.title, previousState, nextState,
      });
      setRetryFeed((value) => value + 1);
      return true;
    } catch {
      setStateError("Could not update this job decision. Check your connection and try again.");
      return false;
    } finally {
      setStateBusy(false);
    }
  }, [stateBusy, setStateBusy, setStateError, setStateMessage, setFeed, setDetail, setUndoAction, setRetryFeed]);
}
