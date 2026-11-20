import { createHash } from "node:crypto";
import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { JOB_AI_ASSESSMENT_VERSION } from "@/thungatha-features/job-discovery/server/job-ai-queue";

const idSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  if (!hasClerkConfiguration()) return apiError("Authentication required", 401);

  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  try {
    identity = await getAuthenticatedIdentity();
  } catch {
    return apiError("Authentication could not be verified", 503);
  }
  if (!identity) return apiError("Authentication required", 401);

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const [profileResult, jobResult] = await Promise.all([
      db.from("profiles").select("profile_version,confirmed_at")
        .eq("user_id", identity.userId).maybeSingle(),
      db.from("jobs").select("description").eq("id", id)
        .not("scout_vacancy_id", "is", null).maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) return apiError("Job not found", 404);
    if (!profileResult.data?.confirmed_at) {
      return NextResponse.json({ status: "profile_unconfirmed", assessment: null });
    }

    const descriptionHash = createHash("sha256")
      .update(jobResult.data.description ?? "")
      .digest("hex");
    const { data, error } = await db.from("job_match_assessments")
      .select("classification,assessment,created_at")
      .eq("user_id", identity.userId)
      .eq("job_id", id)
      .eq("profile_version", profileResult.data.profile_version)
      .eq("job_description_hash", descriptionHash)
      .eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json(data
      ? { status: "ready", ...data }
      : { status: "pending", assessment: null });
  } catch (error) {
    return apiFailure(error);
  }
}
