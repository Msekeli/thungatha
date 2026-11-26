import { createHash } from "node:crypto";
import { z } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { connection, NextResponse } from "next/server";
import {
  createAuthenticatedSupabaseClient,
  createPublicSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { JOB_AI_ASSESSMENT_VERSION } from "@/thungatha-features/job-discovery/server/job-ai-queue";

const idSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>> = null;
  if (hasClerkConfiguration()) {
    try {
      identity = await getAuthenticatedIdentity();
    } catch {
      return apiError("Authentication could not be verified", 503);
    }
  }

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);

  try {
    const db = identity
      ? await createAuthenticatedSupabaseClient(identity.getToken)
      : await createPublicSupabaseClient();
    const { data, error } = await db
      .from("jobs")
      .select(
        "id,scout_vacancy_id,title,employer_name,company_logo_url,description,location_text,application_url,published_at,source_updated_at,updated_at",
      )
      .eq("id", id)
      .not("scout_vacancy_id", "is", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiError("Job not found", 404);

    let state: "saved" | "dismissed" | null = null;
    let matchClassification: "match" | "relevant" | "unclassified" | undefined;
    if (identity) {
      const stateQuery = db
        .from("user_job_states")
        ?.select("state")
        ?.eq("user_id", identity.userId)
        .eq("job_id", id)
        .maybeSingle();
      const profileQuery = db
        .from("profiles")
        ?.select("profile_version,confirmed_at")
        ?.eq("user_id", identity.userId)
        .maybeSingle();
      const [stateResult, profileResult] = await Promise.all([
        stateQuery ?? Promise.resolve({ data: null, error: null }),
        profileQuery ?? Promise.resolve({ data: null, error: null }),
      ]);
      if (stateResult.error) throw stateResult.error;
      if (profileResult.error) throw profileResult.error;
      state = stateResult.data?.state ?? null;
      if (profileResult.data?.confirmed_at) {
        const descriptionHash = createHash("sha256")
          .update(data.description ?? "")
          .digest("hex");
        const assessmentResult = await db
          .from("job_match_assessments")
          ?.select("classification")
          ?.eq("user_id", identity.userId)
          .eq("job_id", id)
          ?.eq("profile_version", profileResult.data.profile_version ?? 1)
          ?.eq("job_description_hash", descriptionHash)
          ?.eq("assessment_version", JOB_AI_ASSESSMENT_VERSION)
          .maybeSingle();
        if (assessmentResult?.error) throw assessmentResult.error;
        matchClassification = assessmentResult?.data
          ?.classification as typeof matchClassification;
      }
    }
    return NextResponse.json({
      job: {
        ...data,
        state,
        ...(matchClassification ? { matchClassification } : {}),
      },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("Job storage is not configured", 503);
    return apiFailure(error);
  }
}
