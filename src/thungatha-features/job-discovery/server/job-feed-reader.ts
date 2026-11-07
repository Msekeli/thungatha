import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { sanitizeJobSearchTerm } from "./job-feed-query-schema";
import { readUserJobStates } from "./job-state-repository";

function emptyFeed(page: number, pageSize: number) {
  return { jobs: [], page, pageSize, total: 0, totalPages: 0 };
}

export async function readJobFeed(
  db: SupabaseClient,
  userId: string | null,
  input: JobFeedQuery,
  statesOnly: boolean,
) {
  const states = userId
    ? await readUserJobStates(db, userId, input.state)
    : [];

  if (statesOnly) return { states };
  if (!userId && input.state !== "all") return emptyFeed(input.page, input.pageSize);

  const stateByJob = new Map(states.map((item) => [item.job_id, item.state]));
  let query = db
    .from("job_discovery_feed")
    .select(
      "id,scout_vacancy_id,title,employer_name,company_logo_url,description,location_text,application_url,published_at,source_updated_at,updated_at",
      { count: "exact" },
    );

  if (input.query) {
    const term = sanitizeJobSearchTerm(input.query);
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,employer_name.ilike.%${term}%,description.ilike.%${term}%`,
      );
    }
  }

  if (input.location) {
    const location = sanitizeJobSearchTerm(input.location);
    if (location) query = query.ilike("location_text", `%${location}%`);
  }

  if (input.publishedWithin !== "any") {
    const ageInHours = {
      "24h": 24,
      "7d": 168,
      "14d": 336,
      "30d": 720,
    }[input.publishedWithin];
    query = query.gte(
      "published_at",
      new Date(Date.now() - ageInHours * 60 * 60 * 1000).toISOString(),
    );
  }

  if (userId && input.state !== "all") {
    const ids = states.map((item) => item.job_id);
    if (!ids.length) return emptyFeed(input.page, input.pageSize);
    query = query.in("id", ids);
  } else if (userId) {
    const dismissed = states
      .filter((item) => item.state === "dismissed")
      .map((item) => item.job_id);
    if (dismissed.length) query = query.not("id", "in", `(${dismissed.join(",")})`);
  }

  const from = (input.page - 1) * input.pageSize;
  const { data, error, count } = await query
    .order("published_at", {
      ascending: input.sortOrder === "oldest",
      nullsFirst: false,
    })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, from + input.pageSize - 1);

  if (error) throw error;
  const jobs = (data ?? []).map((job) => ({
    ...job,
    state: stateByJob.get(job.id) ?? null,
  }));
  const total = count ?? 0;
  return {
    jobs,
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: Math.ceil(total / input.pageSize),
  };
}
