import { connection, NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "@/thungatha-features/cv-studio/server/master-cv";
import { cvJobContextSchema } from "@/thungatha-features/cv-studio/server/job-context-schema";

export async function POST(request: Request) {
  await connection();
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  const body = (await request.json().catch(() => null)) as {
    versionId?: unknown;
    jobContext?: unknown;
  } | null;
  if (
    !body ||
    typeof body.versionId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(body.versionId)
  )
    return apiError("A valid accepted CV version is required.", 400);
  const job = cvJobContextSchema.safeParse(body.jobContext);
  if (!job.success)
    return apiError("A valid job context is required to verify CV reuse.", 400);

  try {
    const profileResult = await readProfile(identity.userId, identity.getToken);
    if (profileResult.error) throw profileResult.error;
    const profile = mapRowToProfileDto(profileResult.data);
    const completion = getProfileCompletion(profile);
    if (!completion.complete || !profile.confirmedAt)
      return NextResponse.json(
        {
          error:
            "Complete and confirm your Profile before reusing a tailored CV.",
          missing: completion.missing,
        },
        { status: 409 },
      );

    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data, error } = await db
      .from("cv_versions")
      .select(
        "id,version_number,status,content,accent_colour,source_profile_version,source_job_id,source_job_snapshot,template_version,accepted_at",
      )
      .eq("id", body.versionId)
      .eq("user_id", identity.userId)
      .eq("cv_kind", "tailored")
      .eq("status", "accepted")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return apiError("The accepted CV version is no longer available.", 404);
    if (data.source_profile_version !== profile.profileVersion)
      return apiError(
        "This accepted CV uses an older Profile version. Update your Profile and review a new CV instead.",
        409,
      );

    const exactMatch = job.data.jobId
      ? data.source_job_id === job.data.jobId
      : data.source_job_snapshot?.descriptionFingerprint ===
        job.data.descriptionFingerprint;
    if (!exactMatch)
      return apiError(
        "This CV was not created for the exact job context. Reuse is not available without a suitability assessment.",
        409,
      );

    return NextResponse.json({ version: data, reused: true });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("CV Studio storage is not configured.", 503);
    return apiFailure(error);
  }
}
