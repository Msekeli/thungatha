import { connection, NextResponse } from "next/server";
import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  createPublicSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

function sanitizeFilterTerm(value: string): string {
  // Treat search input as plain text, never as PostgREST filter syntax.
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const querySchema = z.object({
  query: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  countryCode: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  workMode: z.enum(["onsite", "hybrid", "remote", "unknown"]).optional(),
  employmentType: z.string().trim().max(100).optional(),
  publishedWithin: z.enum(["any", "24h", "7d", "14d", "30d"]).default("any"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  state: z.enum(["all", "saved", "dismissed"]).default("all"),
  sortOrder: z.enum(["relevance", "newest", "oldest"]).default("newest"),
});

export async function GET(request: Request) {
  await connection();
  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  if (hasClerkConfiguration()) {
    try {
      identity = await getAuthenticatedIdentity();
    } catch (error) {
      console.error("[jobs feed API] Clerk authentication failed:", error);
      return apiError("Authentication could not be verified", 503);
    }
  }

  const params = new URL(request.url).searchParams;
  const raw: Record<string, string> = {};
  for (const key of [
    "query",
    "location",
    "countryCode",
    "workMode",
    "employmentType",
    "publishedWithin",
    "page",
    "pageSize",
    "state",
    "sortOrder",
  ]) {
    const value = params.get(key);
    if (value !== null) raw[key] = value;
  }
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) return apiError("Invalid job discovery parameters", 400);
  const input = parsed.data;

  try {
    if (!identity && params.get("statesOnly") === "1")
      return apiError("Authentication required", 401);
    const db = identity
      ? await createAuthenticatedSupabaseClient(identity.getToken)
      : await createPublicSupabaseClient();
    let states: { job_id: string; state: "saved" | "dismissed" }[] = [];
    if (identity) {
      let stateQuery = db
        .from("user_job_states")
        .select("job_id,state")
        .eq("user_id", identity.userId);
      if (input.state !== "all")
        stateQuery = stateQuery.eq("state", input.state);
      const { data: userStates, error: stateError } = await stateQuery;
      if (stateError) throw stateError;
      states = userStates ?? [];
    } else if (input.state !== "all") {
      return NextResponse.json({
        jobs: [],
        page: input.page,
        pageSize: input.pageSize,
        total: 0,
        totalPages: 0,
      });
    }
    const stateByJob = new Map(states.map((item) => [item.job_id, item.state]));
    if (params.get("statesOnly") === "1") {
      return NextResponse.json({ states });
    }

    let query = db
      .from("job_discovery_feed")
      .select(
        "id,title,employer_name,description,location_text,country_code,work_mode,employment_type,salary_min,salary_max,salary_currency,updated_at,published_at",
        { count: "exact" },
      );
    if (input.query) {
      const term = sanitizeFilterTerm(input.query);
      if (term)
        query = query.or(
          `title.ilike.%${term}%,employer_name.ilike.%${term}%,description.ilike.%${term}%`,
        );
    }
    if (input.location) {
      const location = sanitizeFilterTerm(input.location);
      if (location) query = query.ilike("location_text", `%${location}%`);
    }
    if (input.countryCode) query = query.eq("country_code", input.countryCode);
    if (input.workMode) query = query.eq("work_mode", input.workMode);
    if (input.publishedWithin !== "any") {
      const ageInHours = { "24h": 24, "7d": 168, "14d": 336, "30d": 720 }[
        input.publishedWithin
      ];
      const publishedAfter = new Date(
        Date.now() - ageInHours * 60 * 60 * 1000,
      ).toISOString();
      query = query
        .gte("published_at", publishedAfter)
        .not("published_at", "is", null);
    }
    if (input.employmentType) {
      const term = sanitizeFilterTerm(input.employmentType)
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
      if (term) query = query.ilike("employment_type", `%${term}%`);
    }
    if (identity && (input.state === "saved" || input.state === "dismissed")) {
      const ids = states.map((item) => item.job_id);
      if (!ids.length)
        return NextResponse.json({
          jobs: [],
          page: input.page,
          pageSize: input.pageSize,
          total: 0,
          totalPages: 0,
        });
      query = query.in("id", ids);
    } else if (identity) {
      const dismissed = states
        .filter((item) => item.state === "dismissed")
        .map((item) => item.job_id);
      if (dismissed.length)
        query = query.not("id", "in", `(${dismissed.join(",")})`);
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

    const feedRows = data ?? [];
    let jobs: {
      id: string;
      state: "saved" | "dismissed" | null;
      [key: string]: unknown;
    }[] = [];
    if (feedRows.length > 0) {
      const { data: details, error: detailsError } = await db
        .from("jobs")
        .select(
          "id,title,employer_name,description,location_text,country_code,work_mode,employment_type,salary_min,salary_max,salary_currency,updated_at,job_sources!inner(id,provider_key,provider_kind,external_job_id,source_url,application_url,published_at,availability_status)",
        )
        .in(
          "id",
          feedRows.map((job) => job.id),
        )
        .eq("job_sources.availability_status", "active")
        .order("published_at", {
          referencedTable: "job_sources",
          ascending: false,
          nullsFirst: false,
        });
      if (detailsError) throw detailsError;
      const detailsById = new Map((details ?? []).map((job) => [job.id, job]));
      jobs = feedRows.flatMap((row) => {
        const job = detailsById.get(row.id);
        return job ? [{ ...job, state: stateByJob.get(job.id) ?? null }] : [];
      });
    }
    const total = count ?? 0;
    return NextResponse.json({
      jobs,
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("Job storage is not configured", 503);
    if (
      error instanceof Error &&
      (error.message === "No job providers are configured." ||
        error.message === "All configured job providers failed.")
    ) {
      return apiError("Job search is temporarily unavailable", 503);
    }
    console.error("[jobs feed API] Request failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      code:
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined,
    });
    return apiFailure(error);
  }
}
