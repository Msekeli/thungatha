import { useCallback, useEffect } from "react";
import type { Job } from "../job-discovery-utils";
import { JobDetailRequestError, requestJobDetail } from "../request-job-detail";

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
        const detail = await requestJobDetail<Job>(id, signal);
        setDetail(detail);
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setDetailError(
          reason instanceof JobDetailRequestError
            ? reason.message
            : "Could not load this job's details. Check your connection and retry.",
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
