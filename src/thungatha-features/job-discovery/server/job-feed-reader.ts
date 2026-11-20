import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { sanitizeJobSearchTerm } from "./job-feed-query-schema";
import { readUserJobStates } from "./job-state-repository";
import { readCandidateFacts } from "./candidate-fact-reader";
import { jobRequirementsSchema } from "./job-requirement-schema";
import {
  classifyJobRelevance,
  type Relevance,
} from "./relevance-classifier";

type FeedJob = {
  id: string;
  published_at?: string | null;
  updated_at?: string | null;
  extracted_requirements?: unknown;
  matchClassification?: Relevance;
  [key: string]: unknown;
};

const RELEVANCE_CATALOGUE_LIMIT = 5000;
const RELEVANCE_FETCH_BATCH_SIZE = 500;

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

function newestFirst(a: FeedJob, b: FeedJob) {
  const aPublished = a.published_at ? Date.parse(a.published_at) : NaN;
  const bPublished = b.published_at ? Date.parse(b.published_at) : NaN;
  if (
    Number.isFinite(aPublished) &&
    Number.isFinite(bPublished) &&
    aPublished !== bPublished
  ) {
    return bPublished - aPublished;
  }
  if (Number.isFinite(aPublished) !== Number.isFinite(bPublished)) {
    return Number.isFinite(aPublished) ? -1 : 1;
  }
  const aUpdated = a.updated_at ? Date.parse(a.updated_at) : NaN;
  const bUpdated = b.updated_at ? Date.parse(b.updated_at) : NaN;
  if (
    Number.isFinite(aUpdated) &&
    Number.isFinite(bUpdated) &&
    aUpdated !== bUpdated
  ) {
    return bUpdated - aUpdated;
  }
  return a.id.localeCompare(b.id);
}

function relevanceOrder(a: FeedJob, b: FeedJob) {
  const rank = (value: Relevance | undefined) =>
    value === "relevant" ? 0 : value === "partially_relevant" ? 1 : 2;
  return (
    rank(a.matchClassification) - rank(b.matchClassification) ||
    newestFirst(a, b)
  );
}

function classifyJobs(
  jobs: FeedJob[],
  candidate: NonNullable<Awaited<ReturnType<typeof readCandidateFacts>>>,
): FeedJob[] {
  return jobs.map((job) => {
    const parsed = jobRequirementsSchema.safeParse(job.extracted_requirements);
    const classification: Relevance = parsed.success
      ? classifyJobRelevance(candidate, parsed.data).classification
      : "unclassified";
    return { ...job, matchClassification: classification };
  });
}

export async function readJobFeed(
  db: SupabaseClient,
  userId: string | null,
  input: JobFeedQuery,
  statesOnly: boolean,
  getToken?: () => Promise<string | null>,
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

  let candidate: Awaited<ReturnType<typeof readCandidateFacts>> = null;
  if (userId && getToken) {
    try {
      candidate = await readCandidateFacts(
        userId,
        getToken,
        new Date().toISOString().slice(0, 10),
      );
    } catch {
      // Profile/matching failures must not block ordinary discovery.
      candidate = null;
    }
  }

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
  const canRankByProfile =
    input.sortOrder === "relevance" && candidate !== null;
  let data: FeedJob[] = [];
  let count = 0;
  let rankWholeCatalogue = false;

  if (canRankByProfile) {
    // Fetch the complete filtered catalogue in bounded requests. A single
    // large PostgREST range can be silently capped by the project's max_rows.
    let exactCount: number | null = null;
    let reachedEnd = false;
    for (
      let offset = 0;
      offset < RELEVANCE_CATALOGUE_LIMIT;
      offset += RELEVANCE_FETCH_BATCH_SIZE
    ) {
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
    rankWholeCatalogue =
      reachedEnd &&
      count <= RELEVANCE_CATALOGUE_LIMIT &&
      data.length >= count;

    // Above the approved 5,000-job ceiling, do not present a partial-catalogue
    // ranking as complete. Return the requested newest-first page instead.
    if (!rankWholeCatalogue) {
      const pageResult = await buildQuery()
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + input.pageSize - 1);
      if (pageResult.error) throw pageResult.error;
      data = (pageResult.data ?? []) as FeedJob[];
      count = pageResult.count ?? count;
    }
  } else {
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
    count = pageResult.count ?? 0;
  }

  let jobs: FeedJob[] = data.map((job) => ({
    ...job,
    state: stateByJob.get(job.id) ?? null,
  }));

  if (candidate) jobs = classifyJobs(jobs, candidate);

  if (rankWholeCatalogue) {
    jobs.sort(relevanceOrder);
    jobs = jobs.slice(from, from + input.pageSize);
  }

  const total = count;
  return {
    jobs,
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: Math.ceil(total / input.pageSize),
  };
}
