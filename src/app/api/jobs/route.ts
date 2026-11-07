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
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const querySchema = z.object({
  query: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
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
    } catch {
      return apiError("Authentication could not be verified", 503);
    }
  }

  const params = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(params.entries()));
  if (!parsed.success) return apiError("Invalid job discovery parameters", 400);
  const input = parsed.data;

  try {
    if (!identity && params.get("statesOnly") === "1") {
      return apiError("Authentication required", 401);
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
      if (input.state !== "all") {
        stateQuery = stateQuery.eq("state", input.state);
      }
      const { data, error } = await stateQuery;
      if (error) throw error;
      states = data ?? [];
    } else if (input.state !== "all") {
      return NextResponse.json({
        jobs: [],
        page: input.page,
        pageSize: input.pageSize,
        total: 0,
        totalPages: 0,
      });
    }

    if (params.get("statesOnly") === "1") {
      return NextResponse.json({ states });
    }

    const stateByJob = new Map(states.map((item) => [item.job_id, item.state]));
    let query = db
      .from("job_discovery_feed")
      .select(
        "id,scout_vacancy_id,title,employer_name,company_logo_url,description,location_text,application_url,published_at,source_updated_at,updated_at",
        { count: "exact" },
      );

    if (input.query) {
      const term = sanitizeFilterTerm(input.query);
      if (term) {
        query = query.or(
          `title.ilike.%${term}%,employer_name.ilike.%${term}%,description.ilike.%${term}%`,
        );
      }
    }

    if (input.location) {
      const location = sanitizeFilterTerm(input.location);
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

    if (identity && input.state !== "all") {
      const ids = states.map((item) => item.job_id);
      if (!ids.length) {
        return NextResponse.json({
          jobs: [],
          page: input.page,
          pageSize: input.pageSize,
          total: 0,
          totalPages: 0,
        });
      }
      query = query.in("id", ids);
    } else if (identity) {
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

    return NextResponse.json({
      jobs,
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    console.error("[jobs feed API] Request failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
      code:
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined,
    });
    return apiFailure(error);
  }
}
