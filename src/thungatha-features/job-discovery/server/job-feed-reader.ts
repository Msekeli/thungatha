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

const RELEVANCE_CATALOGUE_LIMIT = 5000;
const RELEVANCE_FETCH_BATCH_SIZE = 500;

function newestFirst(a: FeedJob, b: FeedJob) {
  const aPublished = a.published_at ? Date.parse(a.published_at) : NaN;
  const bPublished = b.published_at ? Date.parse(b.published_at) : NaN;
  if (Number.isFinite(aPublished) && Number.isFinite(bPublished) && aPublished !== bPublished) return bPublished - aPublished;
  if (Number.isFinite(aPublished) !== Number.isFinite(bPublished)) return Number.isFinite(aPublished) ? -1 : 1;
  const aUpdated = a.updated_at ? Date.parse(a.updated_at) : NaN;
  const bUpdated = b.updated_at ? Date.parse(b.updated_at) : NaN;
  if (Number.isFinite(aUpdated) && Number.isFinite(bUpdated) && aUpdated !== bUpdated) return bUpdated - aUpdated;
  return a.id.localeCompare(b.id);
}

function relevanceOrder(a: FeedJob, b: FeedJob) {
  const rank = (value: FeedJob["matchClassification"]) =>
    value === "match" ? 0 : value === "relevant" ? 1 : 2;
  return rank(a.matchClassification) - rank(b.matchClassification) || newestFirst(a, b);
}

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
  let profileVersion: number | null = null;
  if (userId) {
    try {
      const profileResult = await db.from("profiles")
        .select("profile_version,confirmed_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (profileResult.error) throw profileResult.error;
      if (profileResult.data?.confirmed_at) profileVersion = profileResult.data.profile_version ?? 1;
    } catch {
      profileVersion = null;
    }
  }

  let data: FeedJob[] = [];
  let count = 0;
  let rankWholeCatalogue = false;

  if (input.sortOrder === "relevance" && profileVersion !== null) {
    let exactCount: number | null = null;
    let reachedEnd = false;
    for (let offset = 0; offset < RELEVANCE_CATALOGUE_LIMIT; offset += RELEVANCE_FETCH_BATCH_SIZE) {
      const batchResult = await buildQuery()
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true })
        .range(offset, offset + RELEVANCE_FETCH_BATCH_SIZE - 1);
      if (batchResult.error) throw batchResult.error;
      const batch = (batchResult.data ?? []) as FeedJob[];
      data.push(...batch);
      if (batchResult.count !== null) exactCount = batchResult.count;
      if (exactCount !== null && data.length >= exactCount) {
        reachedEnd = true;
        break;
      }
      if (batch.length < RELEVANCE_FETCH_BATCH_SIZE) {
        exactCount ??= data.length;
        reachedEnd = true;
        break;
      }
    }
    count = exactCount ?? data.length;
    rankWholeCatalogue = reachedEnd && count <= RELEVANCE_CATALOGUE_LIMIT && data.length >= count;
  }

  if (!rankWholeCatalogue) {
    const pageResult = await buildQuery()
      .order("published_at", {
        ascending: input.sortOrder === "oldest",
        nullsFirst: false,
      })
      .order("updated_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + input.pageSize - 1);
    if (pageResult.error) throw pageResult.error;
    data = (pageResult.data ?? []) as FeedJob[];
    count = pageResult.count ?? count;
  }

  const assessmentsByJob = new Map<string, { hash: string; classification: "match" | "relevant" | "unclassified" }>();
  if (userId && profileVersion !== null && data.length) {
    try {
      for (let offset = 0; offset < data.length; offset += RELEVANCE_FETCH_BATCH_SIZE) {
        const batch = data.slice(offset, offset + RELEVANCE_FETCH_BATCH_SIZE);
        const assessmentResult = await db.from("job_match_assessments")
          .select("job_id,job_description_hash,classification")
          .eq("user_id", userId)
          .eq("profile_version", profileVersion)
          .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
          .in("job_id", batch.map((job) => job.id));
        if (assessmentResult.error) throw assessmentResult.error;
        for (const item of assessmentResult.data ?? []) {
          assessmentsByJob.set(item.job_id, {
            hash: item.job_description_hash,
            classification: item.classification,
          });
        }
      }
    } catch {
      assessmentsByJob.clear();
    }
  }

  let jobs: FeedJob[] = data.map((job) => {
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

  if (rankWholeCatalogue) {
    jobs.sort(relevanceOrder);
    jobs = jobs.slice(from, from + input.pageSize);
  }

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
