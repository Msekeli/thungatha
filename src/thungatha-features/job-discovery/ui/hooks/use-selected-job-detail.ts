"use client";

import { useCallback, useEffect } from "react";
import { getApiError, type Job } from "../job-discovery-utils";

export function useSelectedJobDetail(
  selectedId: string | null,
  retryDetail: number,
  setDetail: (value: Job | null) => void,
  setDetailLoading: (value: boolean) => void,
  setDetailError: (value: string | null) => void,
) {
  const refreshDetail = useCallback(
    async (id: string, signal: AbortSignal) => {
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);
      try {
        const response = await fetch(`/api/jobs/${encodeURIComponent(id)}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        });
        if (!response.ok) {
          setDetailError(await getApiError(response));
          return;
        }
        const data = (await response.json()) as { job: Job };
        if (!data.job?.id) {
          setDetailError(
            "The job details service returned an unexpected response. Please retry.",
          );
          return;
        }
        setDetail(data.job);
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setDetailError(
          "Could not load this job's details. Check your connection and retry.",
        );
      } finally {
        if (!signal.aborted) setDetailLoading(false);
      }
    },
    [setDetail, setDetailLoading, setDetailError],
  );

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    void Promise.resolve().then(() =>
      refreshDetail(selectedId, controller.signal),
    );
    return () => controller.abort();
  }, [selectedId, refreshDetail, retryDetail]);
}
