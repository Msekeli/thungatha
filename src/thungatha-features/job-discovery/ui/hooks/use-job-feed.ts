import { useCallback, useLayoutEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { readWorkspaceCache, writeWorkspaceCache } from "@/lib/workspace-data-cache";
import {
  buildJobFeedParams,
  type Feed,
  type Filters,
} from "../job-discovery-utils";
import { JobFeedRequestError, requestJobFeed } from "../request-job-feed";

type CachedJobFeed = { feed: Feed; dismissedCount: number };
const JOB_FEED_CACHE_TTL = 45 * 1000;

export function useJobFeed(
  userId: string | null,
  enabled: boolean,
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
  const cacheKey = `job-feed:${params}`;

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
        const cached = readWorkspaceCache<CachedJobFeed>(userId, cacheKey, JOB_FEED_CACHE_TTL);
        writeWorkspaceCache(userId, cacheKey, {
          feed: data,
          dismissedCount: cached?.value.dismissedCount ?? 0,
        });
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
          writeWorkspaceCache(userId, cacheKey, { feed: data, dismissedCount: data.total });
        } else if (page === 1) {
          void requestJobFeed(buildJobFeedParams(1, "dismissed", filters), signal)
            .then((dismissedFeed) => {
              if (!signal.aborted) {
                setDismissedCount(dismissedFeed.total);
                writeWorkspaceCache(userId, cacheKey, { feed: data, dismissedCount: dismissedFeed.total });
              }
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
      params, cacheKey, userId, page, category, filters, setLoading, setError,
      setFeed, setDismissedCount, setIsAuthenticated, setSelectedId,
    ],
  );

  useLayoutEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const cached = readWorkspaceCache<CachedJobFeed>(userId, cacheKey, JOB_FEED_CACHE_TTL);
    if (cached) {
      setFeed(cached.value.feed);
      setDismissedCount(cached.value.dismissedCount);
      setSelectedId(current => current && cached.value.feed.jobs.some(job => job.id === current)
        ? current : (cached.value.feed.jobs[0]?.id ?? null));
      setLoading(false);
      setError(null);
      if (cached.fresh && retryFeed === 0) {
        return () => controller.abort();
      }
    } else {
      // Never leave the previous category visible while the new feed is loading.
      setFeed(null);
      setSelectedId(null);
      setLoading(true);
      setError(null);
    }
    void Promise.resolve().then(() => refreshFeed(controller.signal, Boolean(cached)));
    return () => controller.abort();
  }, [refreshFeed, retryFeed, userId, enabled, cacheKey, setFeed, setDismissedCount, setSelectedId, setLoading, setError]);

  return { params };
}
