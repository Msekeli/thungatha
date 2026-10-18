import { connection, NextResponse } from "next/server";
import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
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
  publishedWithin: z.enum(["24h", "7d", "14d", "30d"]).default("30d"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  state: z.enum(["all", "saved", "dismissed"]).default("all"),
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
  ]) {
    const value = params.get(key);
    if (value !== null) raw[key] = value;
  }
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) return apiError("Invalid job discovery parameters", 400);
  const input = parsed.data;

  try {
    if (!identity && input.state !== "all") {
      return NextResponse.json({
        jobs: [],
        page: input.page,
        pageSize: input.pageSize,
        total: 0,
        totalPages: 0,
      });
    }
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
    }
    const stateByJob = new Map(states.map((item) => [item.job_id, item.state]));

    let query = db
      .from("jobs")
      .select(
        "id,title,employer_name,description,location_text,country_code,work_mode,employment_type,salary_min,salary_max,salary_currency,updated_at,job_sources!inner(id,provider_key,provider_kind,external_job_id,source_url,application_url,published_at,availability_status)",
        { count: "exact" },
      )
      .eq("job_sources.availability_status", "active");
    if (input.query) {
      const term = sanitizeFilterTerm(input.query);
      if (term)
        query = query.or(`title.ilike.%${term}%,employer_name.ilike.%${term}%`);
    }
    if (input.location) {
      const location = sanitizeFilterTerm(input.location);
      if (location) query = query.ilike("location_text", `%${location}%`);
    }
    if (input.countryCode) query = query.eq("country_code", input.countryCode);
    if (input.workMode) query = query.eq("work_mode", input.workMode);
    const ageInHours = { "24h": 24, "7d": 168, "14d": 336, "30d": 720 }[
      input.publishedWithin
    ];
    const publishedAfter = new Date(
      Date.now() - ageInHours * 60 * 60 * 1000,
    ).toISOString();
    query = query
      .gte("job_sources.published_at", publishedAfter)
      .not("job_sources.published_at", "is", null);
    if (input.employmentType) {
      // Provider records commonly use values such as "full_time", while the UI
      // naturally uses "Full-time". Normalize separators before querying.
      const term = sanitizeFilterTerm(input.employmentType)
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
      if (term) query = query.ilike("employment_type", `%${term}%`);
    }
    if (input.state === "saved" || input.state === "dismissed") {
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
    } else {
      const dismissed = states
        .filter((item) => item.state === "dismissed")
        .map((item) => item.job_id);
      if (dismissed.length)
        query = query.not("id", "in", `(${dismissed.join(",")})`);
    }
    const from = (input.page - 1) * input.pageSize;
    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .order("published_at", {
        referencedTable: "job_sources",
        ascending: false,
        nullsFirst: false,
      })
      .range(from, from + input.pageSize - 1);
    if (error) throw error;
    const jobs = (data ?? []).map((job) => ({
      ...job,
      state: stateByJob.get(job.id) ?? null,
    }));
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
    console.error("[jobs feed API] Database query failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      details:
        typeof error === "object" && error !== null && "details" in error
          ? error.details
          : undefined,
      hint:
        typeof error === "object" && error !== null && "hint" in error
          ? error.hint
          : undefined,
      code:
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined,
    });
    return apiFailure(error);
  }
}
