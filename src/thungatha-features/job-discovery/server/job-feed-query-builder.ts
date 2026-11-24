import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { sanitizeJobSearchTerm } from "./job-feed-query-schema";

export function buildFeedJobQuery(
  db: SupabaseClient,
  input: JobFeedQuery,
  options: {
    userId: string | null;
    states: Array<{ job_id: string; state: string }>;
    dismissedEmployerKeys: string[];
    employerDismissalsAvailable: boolean;
  },
) {
  let query = db.from("job_discovery_feed").select("*", { count: "exact" });

  if (input.query) {
    const term = sanitizeJobSearchTerm(input.query);
    if (term)
      query = query.or(
        `title.ilike.%${term}%,employer_name.ilike.%${term}%,description.ilike.%${term}%`,
      );
  }
  if (input.location) {
    const loc = sanitizeJobSearchTerm(input.location);
    if (loc) query = query.ilike("location_text", `%${loc}%`);
  }
  if (input.publishedWithin !== "any") {
    const hours = { "24h": 24, "7d": 168, "14d": 336, "30d": 720 }[
      input.publishedWithin
    ];
    query = query.gte(
      "published_at",
      new Date(Date.now() - hours * 3600_000).toISOString(),
    );
  }
  if (
    options.employerDismissalsAvailable &&
    options.userId &&
    input.state !== "dismissed" &&
    options.dismissedEmployerKeys.length
  ) {
    query = query.not(
      "employer_key",
      "in",
      `(${options.dismissedEmployerKeys.join(",")})`,
    );
  }
  const dismissedJobIds = options.states
    .filter((s) => s.state === "dismissed")
    .map((s) => s.job_id);
  if (options.userId && input.state !== "all") {
    query = query.in(
      "id",
      options.states.map((s) => s.job_id),
    );
  } else if (options.userId && dismissedJobIds.length) {
    query = query.not("id", "in", `(${dismissedJobIds.join(",")})`);
  }
  return query;
}
