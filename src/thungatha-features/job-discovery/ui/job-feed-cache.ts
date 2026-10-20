import type { Feed } from "./job-discovery-utils";
import { requestJobFeed } from "./request-job-feed";

type CachedFeed = { savedAt?: number; feed?: Feed };

export function canReusePublicJobFeed(
  page: number,
  category: string,
  filters: {
    query: string;
    location: string;
    workMode: string;
    employmentType: string;
    publishedWithin: string;
  },
) {
  return (
    page === 1 &&
    category === "new" &&
    !filters.query.trim() &&
    !filters.location.trim() &&
    !filters.workMode.trim() &&
    !filters.employmentType.trim() &&
    filters.publishedWithin === "30d"
  );
}

export async function getReusablePublicFeed(
  signal: AbortSignal,
): Promise<Feed | null> {
  try {
    const cached = JSON.parse(
      sessionStorage.getItem("thungatha-public-job-feed-v1") ?? "null",
    ) as CachedFeed | null;
    if (
      !cached?.feed ||
      typeof cached.savedAt !== "number" ||
      Date.now() - cached.savedAt >= 5 * 60 * 1000 ||
      !Array.isArray(cached.feed.jobs)
    )
      return null;

    const response = await fetch("/api/jobs?state=all&statesOnly=1", {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      states?: { job_id: string; state: "saved" | "dismissed" }[];
    };
    const states = payload.states ?? [];
    const dismissed = states.filter((item) => item.state === "dismissed");
    let dismissedCount = 0;
    if (dismissed.length) {
      const dismissedFeed = await requestJobFeed(
        "state=dismissed&page=1&pageSize=1&publishedWithin=30d",
        signal,
      );
      dismissedCount = dismissedFeed.total;
      if (
        cached.feed.jobs.some((job) =>
          dismissed.some((item) => item.job_id === job.id),
        )
      )
        return null;
    }

    const stateById = new Map(states.map((item) => [item.job_id, item.state]));
    return {
      ...cached.feed,
      total: Math.max(0, cached.feed.total - dismissedCount),
      totalPages: Math.ceil(
        Math.max(0, cached.feed.total - dismissedCount) / cached.feed.pageSize,
      ),
      jobs: cached.feed.jobs.map((job) => ({
        ...job,
        state: stateById.get(job.id) ?? null,
      })),
    };
  } catch {
    return null;
  }
}
