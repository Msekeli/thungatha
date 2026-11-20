import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { sanitizeJobSearchTerm } from "./job-feed-query-schema";
import { readUserJobStates } from "./job-state-repository";
import { JOB_AI_ASSESSMENT_VERSION } from "./job-ai-queue";


type FeedJob = {
  id: string;
  published_at?: string | null;
  updated_at?: string | null;
  description?: string | null;
  matchClassification?: "match" | "relevant" | "unclassified";
  [key: string]: unknown;
};

function emptyFeed(page: number, pageSize: number) {
  return { jobs: [], page, pageSize, total: 0, totalPages: 0 };
}

function isMissingEmployerDismissalsSchema(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205"
  );
}

export async function readJobFeed(
  db: SupabaseClient,
  userId: string | null,
  input: JobFeedQuery,
  statesOnly: boolean,
  _getToken?: () => Promise<string | null>,
) {
  const states = userId ? await readUserJobStates(db, userId, input.state) : [];

  let employerDismissals: { employer_key: string; employer_name: string }[] =
    [];
  let employerDismissalsAvailable = false;

  if (userId) {
    const result = await db
      .from("user_employer_dismissals")
      .select("employer_key,employer_name")
      .eq("user_id", userId);

    if (result.error) {
      if (!isMissingEmployerDismissalsSchema(result.error)) throw result.error;
    } else {
      employerDismissals = result.data ?? [];
      employerDismissalsAvailable = true;
    }
  }

  if (statesOnly) return { states, employerDismissals };
  if (!userId && input.state !== "all")
    return emptyFeed(input.page, input.pageSize);
  if (userId && input.state !== "all" && !states.length)
    return emptyFeed(input.page, input.pageSize);

  const stateByJob = new Map(states.map((item) => [item.job_id, item.state]));
  const dismissedEmployerKeys = employerDismissals.map(
    (item) => item.employer_key,
  );
  const dismissedJobIds = states
    .filter((item) => item.state === "dismissed")
    .map((item) => item.job_id);

  const buildQuery = () => {
    let query = db.from("job_discovery_feed").select("*", { count: "exact" });

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

    if (
      employerDismissalsAvailable &&
      userId &&
      input.state !== "dismissed" &&
      dismissedEmployerKeys.length
    ) {
      query = query.not(
        "employer_key",
        "in",
        `(${dismissedEmployerKeys.join(",")})`,
      );
    }

    if (userId && input.state !== "all") {
      query = query.in("id", states.map((item) => item.job_id));
    } else if (userId && dismissedJobIds.length) {
      query = query.not("id", "in", `(${dismissedJobIds.join(",")})`);
    }

    return query;
  };

  const from = (input.page - 1) * input.pageSize;
  const pageResult = await buildQuery()
    .order("published_at", {
      ascending: input.sortOrder === "oldest",
      nullsFirst: false,
    })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, from + input.pageSize - 1);
  if (pageResult.error) throw pageResult.error;

  const pageJobs = (pageResult.data ?? []) as FeedJob[];
  let assessmentsByJob = new Map<string, { hash: string; classification: "match" | "relevant" | "unclassified" }>();

  if (userId && pageJobs.length) {
    try {
      const profileResult = await db.from("profiles")
        .select("profile_version,confirmed_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (profileResult.error) throw profileResult.error;

      if (profileResult.data?.confirmed_at) {
        const assessmentResult = await db.from("job_match_assessments")
          .select("job_id,job_description_hash,classification")
          .eq("user_id", userId)
          .eq("profile_version", profileResult.data.profile_version)
          .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
          .in("job_id", pageJobs.map((job) => job.id));
        if (assessmentResult.error) throw assessmentResult.error;
        assessmentsByJob = new Map((assessmentResult.data ?? []).map((item) => [
          item.job_id,
          { hash: item.job_description_hash, classification: item.classification },
        ]));
      }
    } catch {
      // A stale or unavailable AI assessment must never block the feed.
      assessmentsByJob = new Map();
    }
  }

  const jobs: FeedJob[] = pageJobs.map((job) => {
    const savedAssessment = assessmentsByJob.get(job.id);
    const currentHash = createHash("sha256").update(job.description ?? "").digest("hex");
    return {
      ...job,
      state: stateByJob.get(job.id) ?? null,
      ...(savedAssessment?.hash === currentHash
        ? { matchClassification: savedAssessment.classification }
        : {}),
    };
  });
  const count = pageResult.count ?? 0;

  const safeJobs = jobs.map((job) => {
    const safeJob = { ...job };
    delete safeJob.extracted_requirements;
    delete safeJob.requirements_description_hash;
    delete safeJob.requirements_extraction_version;
    delete safeJob.requirements_extraction_status;
    return safeJob;
  });

  const total = count;
  return {
    jobs: safeJobs,
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: Math.ceil(total / input.pageSize),
  };
}
