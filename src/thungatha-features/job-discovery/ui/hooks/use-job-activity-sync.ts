"use client";

import { useEffect, useRef } from "react";
import { getApiError, type JobActivity } from "../job-discovery-utils";

export function useJobActivitySync(
  isSignedIn: boolean,
  selectedId: string | null,
  setJobActivity: (
    value: { jobId: string; activity: JobActivity } | null,
  ) => void,
  setActivityError: (value: string | null) => void,
  setForceAppliedPrompt: (value: boolean) => void,
  setDismissedPromptForJobId: (value: string | null) => void,
) {
  const wasHidden = useRef(false);
  useEffect(() => {
    if (!isSignedIn || !selectedId) return;
    const jobId = selectedId;
    let controller: AbortController | null = null;
    const loadActivity = () => {
      controller?.abort();
      controller = new AbortController();
      const requestController = controller;
      void fetch(`/api/jobs/${encodeURIComponent(jobId)}/activity`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: requestController.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await getApiError(response));
          const payload = (await response.json()) as { activity?: JobActivity };
          if (!payload.activity)
            throw new Error("Unexpected activity response");
          setActivityError(null);
          setJobActivity({ jobId, activity: payload.activity });
        })
        .catch((reason) => {
          if (reason instanceof Error && reason.name === "AbortError") return;
          setActivityError("Application activity could not be loaded.");
        });
    };
    const handleReturnToPage = () => {
      setForceAppliedPrompt(false);
      setDismissedPromptForJobId(null);
      loadActivity();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        wasHidden.current = true;
      } else if (wasHidden.current) {
        wasHidden.current = false;
        handleReturnToPage();
      }
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) handleReturnToPage();
    };
    loadActivity();
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      controller?.abort();
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isSignedIn,
    selectedId,
    setJobActivity,
    setActivityError,
    setForceAppliedPrompt,
    setDismissedPromptForJobId,
  ]);
}
