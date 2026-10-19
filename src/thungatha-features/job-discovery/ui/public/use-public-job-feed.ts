"use client";

import { useEffect, useState } from "react";

export type PublicJobFeedItem = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  country_code: string | null;
  work_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
  job_sources: { source_url: string | null; application_url: string | null; published_at: string | null; availability_status: string; provider_kind: string }[] | { source_url: string | null; application_url: string | null; published_at: string | null; availability_status: string; provider_kind: string } | null;
  state: "saved" | "dismissed" | null;
};
type Feed = { jobs: PublicJobFeedItem[]; page: number; pageSize: number; total: number; totalPages: number };

export function usePublicJobFeed(query: string, location: string, retry: number) {
  const [jobs, setJobs] = useState<PublicJobFeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: "1", pageSize: "30", publishedWithin: "30d" });
      if (query.trim()) params.set("query", query.trim());
      if (location.trim() && location !== "Cape Town + 50 km") params.set("location", location.trim());
      try {
        const response = await fetch("/api/jobs?" + params, {
          signal: controller.signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(response.status === 503
            ? "Job Discovery is temporarily unavailable. Please try again shortly."
            : "We couldn't load jobs right now. Please try again.");
        }
        const data = await response.json() as Feed;
        if (!Array.isArray(data.jobs)) throw new Error("The jobs service returned an unexpected response.");
        setJobs(data.jobs);
        setTotal(data.total);
        if (!query.trim() && location === "Cape Town + 50 km") {
          try {
            sessionStorage.setItem("thungatha-public-job-feed-v1", JSON.stringify({ savedAt: Date.now(), feed: data }));
          } catch {
            // Optional session cache.
          }
        }
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "We couldn't load jobs right now.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, location, retry]);

  return { jobs, setJobs, total, loading, setLoading, error, setError };
}
