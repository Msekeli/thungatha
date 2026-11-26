import { connection, NextResponse } from "next/server";
import { apiError } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { getConfirmedCvProfile } from "@/thungatha-features/cv-studio/server/cv-profile-route-context";
import { handleCvDraftRouteError } from "@/thungatha-features/cv-studio/server/cv-draft-route-error";
import {
  cvSuitabilityInputSchema,
  cvSuitabilityResponseSchema,
} from "@/thungatha-features/cv-studio/server/cv-suitability-schema";
import { findMatchingAcceptedVersions } from "@/thungatha-features/cv-studio/server/cv-suitability-service";

export async function POST(request: Request) {
  await connection();
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("A valid JSON request is required.", 400);
  }
  const parsed = cvSuitabilityInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message ?? "Invalid suitability request.",
      400,
    );
  }

  try {
    const profileContext = await getConfirmedCvProfile(
      identity,
      (missing) => NextResponse.json({
        status: "profile_required",
        missing,
      }, { status: 409 }),
    );
    if (profileContext.response) return profileContext.response;
    const profile = profileContext.profile;
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data: master, error } = await db
      .from("cv_versions")
      .select("id,source_profile_version,cv_kind,status")
      .eq("id", parsed.data.masterVersionId)
      .eq("user_id", identity.userId)
      .maybeSingle();
    if (error) throw error;
    if (!master || master.cv_kind !== "master" || master.status !== "current") {
      return apiError("The selected master CV is unavailable.", 404);
    }
    if (master.source_profile_version !== profile.profileVersion) {
      return apiError("Refresh the master CV before assessing this job.", 409);
    }

    const matchingVersions = await findMatchingAcceptedVersions(
      db, identity.userId, profile.profileVersion, parsed.data.jobContext,
    );
    const result = cvSuitabilityResponseSchema.parse({
      status: matchingVersions.length
        ? "existing_version_found"
        : "new_version_recommended",
      masterVersionId: master.id,
      sourceProfileVersion: profile.profileVersion,
      matchingVersions,
      recommendation: matchingVersions.length
        ? "reuse_existing"
        : "prepare_new_draft",
      explanation: matchingVersions.length
        ? "An accepted CV version exists for this exact job reference or description. Review it before deciding whether to reuse it or prepare a new draft."
        : "No accepted CV version exists for this exact job reference or description. A new tailored draft can be prepared, but semantic suitability has not yet been assessed.",
      semanticAssessment: "unavailable",
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleCvDraftRouteError(error);
  }
}
