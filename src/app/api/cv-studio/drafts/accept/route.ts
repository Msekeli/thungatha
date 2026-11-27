import { connection, NextResponse } from "next/server";
import { apiError } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { getConfirmedCvProfile } from "@/thungatha-features/cv-studio/server/cv-profile-route-context";
import { handleCvDraftRouteError } from "@/thungatha-features/cv-studio/server/cv-draft-route-error";

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
    const profileContext = await getConfirmedCvProfile(identity, (missing) =>
      NextResponse.json(
        {
          error:
            "Complete and confirm your Profile before accepting a tailored CV.",
          missing,
        },
        { status: 409 },
      ),
    );
    if (profileContext.response) return profileContext.response;
    const profile = profileContext.profile;
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
    if (!existing || existing.cv_kind !== "tailored") {
      return apiError("This tailored draft could not be found.", 404);
    }
    if (existing.status === "accepted") {
      return NextResponse.json({ version: existing, alreadyAccepted: true });
    }
    if (existing.status !== "draft") {
      return apiError("Only a working draft can be accepted.", 409);
    }
    if (existing.source_profile_version !== profile.profileVersion) {
      return apiError(
        "Your Profile has changed. Refresh the master CV and review a new draft before accepting.",
        409,
      );
    }

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
    return handleCvDraftRouteError(error);
  }
}
