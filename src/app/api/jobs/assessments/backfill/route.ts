import { connection, NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { enqueueAllJobAssessments } from "@/thungatha-features/job-discovery/server/job-ai-queue";

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
    return NextResponse.json({ status: "queued", ...result }, { status: 202 });
  } catch (error) {
    return apiFailure(error);
  }
}
