import { after, connection, NextResponse } from "next/server";
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
import { enqueueVisibleJobAssessments } from "@/thungatha-features/job-discovery/server/job-ai-queue";
import { processJobAiQueue } from "@/thungatha-features/job-discovery/server/job-ai-worker";

export const maxDuration = 120;

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
      identity?.getToken,
    );

    const feedJobs = "jobs" in result ? result.jobs ?? [] : [];
    if (identity && !statesOnly && feedJobs.length) {
      try {
        const queued = await enqueueVisibleJobAssessments(
          identity.userId,
          feedJobs.map((job) => job.id).filter((id): id is string => typeof id === "string"),
        );
        if (queued > 0) {
          after(async () => {
            try {
              await processJobAiQueue(1);
            } catch (workerError) {
              console.error("[AI job matching] Background task failed:", {
                message: workerError instanceof Error ? workerError.message : "Unknown worker error",
              });
            }
          });
        }
      } catch (queueError) {
        // Queue failures must not interrupt ordinary job discovery.
        console.error("[AI job matching] Could not enqueue visible jobs:", {
          message: queueError instanceof Error ? queueError.message : "Unknown queue error",
        });
      }
    }

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
