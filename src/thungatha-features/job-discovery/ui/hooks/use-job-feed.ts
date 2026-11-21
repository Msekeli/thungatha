import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  buildJobFeedParams,
  type Feed,
  type Filters,
} from "../job-discovery-utils";
import { JobFeedRequestError, requestJobFeed } from "../request-job-feed";

export function useJobFeed(
  page: number,
  category: string,
  filters: Filters,
  sortOrder: string,
  retryFeed: number,
  setFeed: Dispatch<SetStateAction<Feed | null>>,
  setDismissedCount: Dispatch<SetStateAction<number>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>,
  setSelectedId: Dispatch<SetStateAction<string | null>>,
) {
  const params = useMemo(
    () => buildJobFeedParams(page, category, filters, sortOrder),
    [page, category, filters, sortOrder],
  );
  const refreshFeed = useCallback(
    async function refresh(signal: AbortSignal, background = false) {
      if (!background) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await requestJobFeed(params, signal);
        setIsAuthenticated(true);
        setFeed(data);
        if (data.jobs.some((job) => job.matchStatus === "processing")) {
          window.setTimeout(() => {
            if (!signal.aborted) void refresh(signal, true);
          }, 60_000);
        }
        setSelectedId((current) =>
          current && data.jobs.some((job) => job.id === current)
            ? current
            : (data.jobs[0]?.id ?? null),
        );
        if (category === "dismissed") {
          setDismissedCount(data.total);
        } else if (page === 1) {
          void requestJobFeed(
            buildJobFeedParams(1, "dismissed", filters),
            signal,
          )
            .then((dismissedFeed) => {
              if (!signal.aborted) setDismissedCount(dismissedFeed.total);
            })
            .catch(() => {
              // Count refresh is independent; it must not fail the main feed.
            });
        }
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        if (background) {
          window.setTimeout(() => {
            if (!signal.aborted) void refresh(signal, true);
          }, 60_000);
          return;
        }
        setFeed(null);
        if (reason instanceof JobFeedRequestError)
          setIsAuthenticated(reason.status !== 401);
        setError(
          reason instanceof JobFeedRequestError
            ? reason.message
            : "Could not reach Job Discovery. Check your connection and retry.",
        );
      } finally {
        if (!signal.aborted && !background) setLoading(false);
      }
    },
    [
      params,
      page,
      category,
      filters,
      sortOrder,
      setLoading,
      setError,
      setFeed,
      setDismissedCount,
      setIsAuthenticated,
      setSelectedId,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refreshFeed(controller.signal));
    return () => controller.abort();
  }, [refreshFeed, retryFeed]);

  return { params };
}
