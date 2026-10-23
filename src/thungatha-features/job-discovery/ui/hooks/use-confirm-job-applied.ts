import { useCallback } from "react";
import { getApiError, type Job, type JobActivity } from "../job-discovery-utils";

export function useConfirmJobApplied(
  job: Job | null,
  busy: boolean,
  setBusy: (value: boolean) => void,
  setError: (value: string | null) => void,
  setMessage: (value: string | null) => void,
  setActivity: (value: { jobId: string; activity: JobActivity } | null) => void,
  setPrompt: (value: boolean) => void,
  setDismissedPromptForJobId: (value: string | null) => void,
  retryFeed: (value: (current: number) => number) => void,
) {
  return useCallback(async () => {
    if (!job || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(job.id)}/activity`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "confirm_applied" }),
        cache: "no-store",
      });
      if (!response.ok) {
        setError(await getApiError(response));
        return;
      }
      const payload = (await response.json()) as { activity: JobActivity };
      setActivity({ jobId: job.id, activity: payload.activity });
      setPrompt(false);
      setDismissedPromptForJobId(null);
      setMessage("Application confirmation recorded.");
      retryFeed((value) => value + 1);
    } catch {
      setError("Could not record your application confirmation. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [
    job,
    busy,
    setBusy,
    setError,
    setActivity,
    setPrompt,
    setDismissedPromptForJobId,
    setMessage,
    retryFeed,
  ]);
}
