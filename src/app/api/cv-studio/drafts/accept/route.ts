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

export async function POST(request: Request) {
  await connection();
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;

  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
  } | null;
  if (
    !body ||
    typeof body.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.id,
    )
  ) {
    return apiError("A valid draft ID is required.", 400);
  }

  try {
    const profileResult = await readProfile(identity.userId, identity.getToken);
    if (profileResult.error) throw profileResult.error;
    const profile = mapRowToProfileDto(profileResult.data);
    const completion = getProfileCompletion(profile);
    if (!completion.complete || !profile.confirmedAt) {
      return NextResponse.json(
        {
          error:
            "Complete and confirm your Profile before accepting a tailored CV.",
          missing: completion.missing,
        },
        { status: 409 },
      );
    }

    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data: existing, error: readError } = await db
      .from("cv_versions")
      .select(
        "id,cv_kind,status,source_profile_version,content,suggestions,tailoring_assessment,accent_colour,version_number,source_job_snapshot,source_job_id,parent_version_id,template_version",
      )
      .eq("id", body.id)
      .eq("user_id", identity.userId)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing || existing.cv_kind !== "tailored")
      return apiError("This tailored draft could not be found.", 404);
    if (existing.status === "accepted")
      return NextResponse.json({ version: existing, alreadyAccepted: true });
    if (existing.status !== "draft")
      return apiError("Only a working draft can be accepted.", 409);
    if (existing.source_profile_version !== profile.profileVersion)
      return apiError(
        "Your Profile has changed. Refresh the master CV and review a new draft before accepting.",
        409,
      );

    const { data, error } = await db
      .from("cv_versions")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("user_id", identity.userId)
      .eq("cv_kind", "tailored")
      .eq("status", "draft")
      .eq("source_profile_version", profile.profileVersion)
      .select(
        "id,cv_kind,status,source_profile_version,content,suggestions,tailoring_assessment,accent_colour,version_number,source_job_snapshot,source_job_id,parent_version_id,template_version,accepted_at,updated_at",
      )
      .single();
    if (error) throw error;
    return NextResponse.json({ version: data });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("CV Studio storage is not configured.", 503);
    return apiFailure(error);
  }
}
