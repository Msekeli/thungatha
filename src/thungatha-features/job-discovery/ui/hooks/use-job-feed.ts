import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  buildJobFeedParams,
  type Feed,
  type Filters,
} from "../job-discovery-utils";
import { JobFeedRequestError, requestJobFeed } from "../request-job-feed";
import {
  canReusePublicJobFeed,
  getReusablePublicFeed,
} from "../job-feed-cache";

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
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        if (canReusePublicJobFeed(page, category, filters)) {
          const cached = await getReusablePublicFeed(signal);
          if (cached) {
            setIsAuthenticated(true);
            setFeed(cached);
            setSelectedId((current) =>
              current && cached.jobs.some((job) => job.id === current)
                ? current
                : null,
            );
            void requestJobFeed(
              buildJobFeedParams(1, "dismissed", filters),
              signal,
            ).then((dismissedFeed) => {
              if (!signal.aborted) setDismissedCount(dismissedFeed.total);
            }).catch(() => {
              // Keep the last known count if the separate count request fails.
            });
            return;
          }
        }
        const data = await requestJobFeed(params, signal);
        setIsAuthenticated(true);
        setFeed((current) => {
          if (page <= 1 || !current) return data;
          const knownIds = new Set(current.jobs.map((job) => job.id));
          return {
            ...data,
            jobs: [
              ...current.jobs,
              ...data.jobs.filter((job) => !knownIds.has(job.id)),
            ],
          };
        });
        setSelectedId((current) =>
          current && (page > 1 || data.jobs.some((job) => job.id === current))
            ? current
            : null,
        );
        if (category === "dismissed") {
          setDismissedCount(data.total);
        } else if (page === 1) {
          void requestJobFeed(
            buildJobFeedParams(1, "dismissed", filters),
            signal,
          ).then((dismissedFeed) => {
            if (!signal.aborted) setDismissedCount(dismissedFeed.total);
          }).catch(() => {
            // Count refresh is independent; it must not fail the main feed.
          });
        }
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setFeed(null);
        if (reason instanceof JobFeedRequestError)
          setIsAuthenticated(reason.status !== 401);
        setError(
          reason instanceof JobFeedRequestError
            ? reason.message
            : "Could not reach Job Discovery. Check your connection and retry.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
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
