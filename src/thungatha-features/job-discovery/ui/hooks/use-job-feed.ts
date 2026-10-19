import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  getApiError, buildJobFeedParams, isValidFeed,
  type Feed, type Filters,
} from "../job-discovery-utils";
import { canReusePublicJobFeed, getReusablePublicFeed } from "../job-feed-cache";

export function useJobFeed(
  page: number,
  category: string,
  filters: Filters,
  retryFeed: number,
  setFeed: Dispatch<SetStateAction<Feed | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>,
  setSelectedId: Dispatch<SetStateAction<string | null>>,
) {
  const params = useMemo(
    () => buildJobFeedParams(page, category, filters),
    [page, category, filters],
  );
  const refreshFeed = useCallback(async (signal: AbortSignal) => {
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
              : cached.jobs[0]?.id ?? null,
          );
          return;
        }
      }
      const response = await fetch(`/api/jobs?${params}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });
      if (!response.ok) {
        setFeed(null);
        setError(await getApiError(response));
        setIsAuthenticated(response.status !== 401);
        return;
      }
      setIsAuthenticated(true);
      const data = await response.json() as Feed;
      if (!isValidFeed(data)) {
        setFeed(null);
        setError("The jobs service returned an unexpected response. Please retry.");
        return;
      }
      setFeed((current) => {
        if (page <= 1 || !current) return data;
        const knownIds = new Set(current.jobs.map((job) => job.id));
        return {
          ...data,
          jobs: [...current.jobs, ...data.jobs.filter((job) => !knownIds.has(job.id))],
        };
      });
      setSelectedId((current) =>
        current && (page > 1 || data.jobs.some((job) => job.id === current))
          ? current
          : data.jobs[0]?.id ?? null,
      );
    } catch (reason) {
      if (reason instanceof Error && reason.name === "AbortError") return;
      setFeed(null);
      setError("Could not reach Job Discovery. Check your connection and retry.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [
    params, page, category, filters, setLoading, setError, setFeed,
    setIsAuthenticated, setSelectedId,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refreshFeed(controller.signal));
    return () => controller.abort();
  }, [refreshFeed, retryFeed]);

  return { params };
}
