import type { Feed } from "./job-discovery-utils";

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
  return page === 1 && category === "new" &&
    !filters.query.trim() && !filters.location.trim() &&
    !filters.workMode.trim() && !filters.employmentType.trim() &&
    filters.publishedWithin === "30d";
}

export async function getReusablePublicFeed(
  signal: AbortSignal,
): Promise<Feed | null> {
  try {
    const cached = JSON.parse(
      sessionStorage.getItem("thungatha-public-job-feed-v1") ?? "null",
    ) as CachedFeed | null;
    if (
      !cached?.feed || typeof cached.savedAt !== "number" ||
      Date.now() - cached.savedAt >= 5 * 60 * 1000 ||
      !Array.isArray(cached.feed.jobs)
    ) return null;

    const response = await fetch("/api/jobs?state=all&statesOnly=1", {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!response.ok) return null;

    const payload = await response.json() as {
      states?: { job_id: string; state: "saved" | "dismissed" }[];
    };
    const states = payload.states ?? [];
    if (states.some((item) => item.state === "dismissed")) return null;

    const stateById = new Map(states.map((item) => [item.job_id, item.state]));
    return {
      ...cached.feed,
      jobs: cached.feed.jobs.map((job) => ({
        ...job,
        state: stateById.get(job.id) ?? null,
      })),
    };
  } catch {
    return null;
  }
}
