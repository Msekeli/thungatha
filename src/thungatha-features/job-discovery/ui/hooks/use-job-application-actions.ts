"use client";

import { useCallback } from "react";
import {
  getApiError,
  type Job,
  type JobActivity,
} from "../job-discovery-utils";

export function useJobApplicationActions(
  isSignedIn: boolean,
  setStateError: (value: string | null) => void,
  setJobActivity: (
    value: { jobId: string; activity: JobActivity } | null,
  ) => void,
  setForceAppliedPrompt: (value: boolean) => void,
  setDismissedPromptForJobId: (value: string | null) => void,
) {
  const openApplicationLink = useCallback(
    (job: Job, url: string) => {
      if (!isSignedIn) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
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
      isSignedIn,
      setForceAppliedPrompt,
      setDismissedPromptForJobId,
      setStateError,
      setJobActivity,
    ],
  );

  return { openApplicationLink };
}
