"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { PublicJob as PublicJobFeedItem } from "./public-job-types";
import { requestJobFeed } from "../request-job-feed";

export function usePublicJobFeed(
  query: string,
  location: string,
  employmentType: string,
  publishedWithin: string,
  workMode: string[],
  retry: number,
  setSelectedId: Dispatch<SetStateAction<string | null>>,
) {
  const [jobs, setJobs] = useState<PublicJobFeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: "1",
        pageSize: "30",
        publishedWithin: publishedWithin || "30d",
      });
      if (query.trim()) params.set("query", query.trim());
      if (location.trim()) params.set("location", location.trim());
      if (employmentType && employmentType !== "all")
        params.set("employmentType", employmentType);
      // The API currently accepts one work mode; multi-select combinations are
      // completed by the shared client-side filter on the returned feed.
      if (workMode.length === 1) params.set("workMode", workMode[0]);
      try {
        const data = await requestJobFeed(params.toString(), controller.signal);
        setJobs(data.jobs);
        setTotal(data.total);
        setSelectedId((current) =>
          current && data.jobs.some((job) => job.id === current)
            ? current
            : (data.jobs[0]?.id ?? null),
        );
        if (
          !query.trim() && !location.trim() &&
          (!employmentType || employmentType === "all") &&
          publishedWithin === "30d" && workMode.length === 0
        ) {
          try {
            sessionStorage.setItem(
              "thungatha-public-job-feed-v1",
              JSON.stringify({ savedAt: Date.now(), feed: data }),
            );
          } catch {
            // Optional session cache.
          }
        }
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(
          reason instanceof Error
            ? reason.message
            : "We couldn't load jobs right now.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, location, employmentType, publishedWithin, workMode, retry, setSelectedId]);

  return { jobs, setJobs, total, loading, setLoading, error, setError };
}
