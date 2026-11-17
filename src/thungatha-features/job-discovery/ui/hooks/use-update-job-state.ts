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
  setSelectedId: SetValue<string | null>,
  setUndoAction: (
    value: {
      jobId: string;
      title: string;
      employerName: string;
      dismissalScope: "job" | "employer";
      previousState: "saved" | "dismissed" | null;
      nextState: "saved" | "dismissed" | null;
    } | null,
  ) => void,
  setRetryFeed: (value: (current: number) => number) => void,
) {
  return useCallback(
    async (
      job: Job,
      nextState: "saved" | "dismissed" | null,
      recordUndo = true,
      dismissalScope: "job" | "employer" = "job",
    ): Promise<boolean> => {
      if (stateBusy) return false;
      const previousState = job.state ?? null;
      setStateBusy(true);
      setStateError(null);
      setStateMessage(null);
      try {
        const response = await fetch(
          "/api/jobs/" + encodeURIComponent(job.id) + "/state",
          {
            method: nextState ? "PUT" : "DELETE",
            headers: {
              Accept: "application/json",
              ...(nextState ? { "Content-Type": "application/json" } : {}),
            },
            ...(nextState
              ? {
                  body: JSON.stringify({
                    state: nextState,
                    ...(nextState === "dismissed"
                      ? { scope: dismissalScope }
                      : {}),
                  }),
                }
              : {}),
            cache: "no-store",
          },
        );
        if (!response.ok) {
          setStateError(await getApiError(response));
          return false;
        }
        setFeed((current) => {
          if (!current) return current;

          if (nextState === "dismissed") {
            const employerKey = (value: string | null | undefined) =>
              (value ?? "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "");

            const jobs = current.jobs.filter((item) => {
              if (dismissalScope === "employer") {
                return (
                  employerKey(item.employer_name) !==
                  employerKey(job.employer_name)
                );
              }
              return item.id !== job.id;
            });

            const removedCount = current.jobs.length - jobs.length;
            return {
              ...current,
              jobs,
              total: Math.max(0, current.total - removedCount),
              totalPages: Math.ceil(
                Math.max(0, current.total - removedCount) / current.pageSize,
              ),
            };
          }

          return {
            ...current,
            jobs: current.jobs.map((item) =>
              item.id === job.id ? { ...item, state: nextState } : item,
            ),
          };
        });
        setDetail((current) =>
          current?.id === job.id ? { ...current, state: nextState } : current,
        );
        if (nextState === "dismissed") {
          setSelectedId((current) => (current === job.id ? null : current));
        }
        if (recordUndo)
          setUndoAction({
            jobId: job.id,
            title: job.title,
            employerName: job.employer_name ?? "Company",
            dismissalScope,
            previousState,
            nextState,
          });
        setRetryFeed((value) => value + 1);
        return true;
      } catch {
        setStateError(
          "Could not update this job decision. Check your connection and try again.",
        );
        return false;
      } finally {
        setStateBusy(false);
      }
    },
    [
      stateBusy,
      setStateBusy,
      setStateError,
      setStateMessage,
      setFeed,
      setDetail,
      setSelectedId,
      setUndoAction,
      setRetryFeed,
    ],
  );
}
