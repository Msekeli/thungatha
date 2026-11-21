import { after, connection, NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { enqueueAllJobAssessments } from "@/thungatha-features/job-discovery/server/job-ai-queue";
import { processJobAiQueue } from "@/thungatha-features/job-discovery/server/job-ai-worker";

export const maxDuration = 120;

export async function POST() {
  await connection();
  if (!hasClerkConfiguration()) return apiError("Authentication required", 401);
  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  try {
    identity = await getAuthenticatedIdentity();
  } catch {
    return apiError("Authentication could not be verified", 503);
  }
  if (!identity) return apiError("Authentication required", 401);

  try {
    const result = await enqueueAllJobAssessments(identity.userId);
    if (result.eligible === 0) {
      return NextResponse.json({ status: "no_jobs", ...result });
    }
    if (result.queued > 0) {
      after(async () => {
        try {
          await processJobAiQueue(5);
        } catch (error) {
          console.error("[AI job matching] Backfill batch failed:", {
            message: error instanceof Error ? error.message : "Unknown worker error",
          });
        }
      });
    }
    return NextResponse.json({ status: "queued", ...result, initialBatchSize: 5 }, { status: 202 });
  } catch (error) {
    return apiFailure(error);
  }
}
