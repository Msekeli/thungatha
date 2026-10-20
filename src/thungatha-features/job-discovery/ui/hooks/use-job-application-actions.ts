"use client";

import { useCallback } from "react";
import {
  getApiError,
  type Job,
  type JobActivity,
} from "../job-discovery-utils";

export function useJobApplicationActions(
  selectedDetail: Job | null,
  stateBusy: boolean,
  setStateBusy: (value: boolean) => void,
  setStateError: (value: string | null) => void,
  setStateMessage: (value: string | null) => void,
  setJobActivity: (
    value: { jobId: string; activity: JobActivity } | null,
  ) => void,
  setForceAppliedPrompt: (value: boolean) => void,
  setDismissedPromptForJobId: (value: string | null) => void,
  setRetryFeed: (value: (current: number) => number) => void,
) {
  const openApplicationLink = useCallback(
    (job: Job, url: string) => {
      setForceAppliedPrompt(true);
      setDismissedPromptForJobId(null);
      window.open(url, "_blank", "noopener,noreferrer");
      setStateError(null);
      void fetch(`/api/jobs/${encodeURIComponent(job.id)}/activity`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "opened_application" }),
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await getApiError(response));
          const payload = (await response.json()) as { activity: JobActivity };
          setJobActivity({ jobId: job.id, activity: payload.activity });
        })
        .catch(() =>
          setStateError(
            "The application page opened, but Thungatha could not record that visit.",
          ),
        );
    },
    [
      setForceAppliedPrompt,
      setDismissedPromptForJobId,
      setStateError,
      setJobActivity,
    ],
  );

  const confirmApplied = useCallback(async () => {
    if (!selectedDetail || stateBusy) return;
    setStateBusy(true);
    setStateError(null);
    try {
      const response = await fetch(
        `/api/jobs/${encodeURIComponent(selectedDetail.id)}/activity`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "confirm_applied" }),
          cache: "no-store",
        },
      );
      if (!response.ok) {
        setStateError(await getApiError(response));
        return;
      }
      const payload = (await response.json()) as { activity: JobActivity };
      setJobActivity({ jobId: selectedDetail.id, activity: payload.activity });
      setForceAppliedPrompt(false);
      setDismissedPromptForJobId(null);
      setStateMessage("Application confirmation recorded.");
      setRetryFeed((value) => value + 1);
    } catch {
      setStateError(
        "Could not record your application confirmation. Please try again.",
      );
    } finally {
      setStateBusy(false);
    }
  }, [
    selectedDetail,
    stateBusy,
    setStateBusy,
    setStateError,
    setJobActivity,
    setForceAppliedPrompt,
    setDismissedPromptForJobId,
    setStateMessage,
    setRetryFeed,
  ]);

  return { openApplicationLink, confirmApplied };
}
