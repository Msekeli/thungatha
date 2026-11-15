import { connection, NextResponse } from "next/server";
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
import { jobFeedQuerySchema } from "@/thungatha-features/job-discovery/server/job-feed-query-schema";
import { syncScoutVacanciesIfDue } from "@/thungatha-features/job-discovery/server/scout-export-client";
import { readJobFeed } from "@/thungatha-features/job-discovery/server/job-feed-reader";

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
  const parsed = jobFeedQuerySchema.safeParse(
    Object.fromEntries(params.entries()),
  );
  if (!parsed.success) return apiError("Invalid job discovery parameters", 400);

  const statesOnly = params.get("statesOnly") === "1";
  if (statesOnly && !identity) return apiError("Authentication required", 401);

  try {
    if (process.env.SCOUT_API_BASE_URL && process.env.SCOUT_EXPORT_API_KEY) {
      try {
        await syncScoutVacanciesIfDue(new URL(request.url).origin);
      } catch (syncError) {
        console.error("[Scout vacancy sync] Failed before feed read:", {
          errorName: syncError instanceof Error ? syncError.name : "unknown",
          message:
            syncError instanceof Error ? syncError.message : "Unknown error",
        });
        return apiError("The job feed could not be refreshed from Scout.", 503);
      }
    }
    const db = identity
      ? await createAuthenticatedSupabaseClient(identity.getToken)
      : await createPublicSupabaseClient();
    const result = await readJobFeed(
      db,
      identity?.userId ?? null,
      parsed.data,
      statesOnly,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("Job storage is not configured", 503);
    }
    console.error("[jobs feed API] Request failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return apiFailure(error);
  }
}
