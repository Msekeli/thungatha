import "server-only";
import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { buildMasterCvContent, getProfileCompletion } from "./master-cv";
import { getOrCreateMasterCv } from "./cv-master-repository";

async function loadProfile(
  userId: string,
  getToken: () => Promise<string | null>,
) {
  const { data, error } = await readProfile(userId, getToken);
  if (error) throw error;
  const profile = mapRowToProfileDto(data);
  return { profile, completion: getProfileCompletion(profile) };
}

function isMissingCvStorage(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  const code = (error as { code?: string }).code;
  return code === "42P01" || code === "PGRST205";
}

export async function handleCvStudioRequest() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;

  try {
    const { profile, completion } = await loadProfile(
      identity.userId,
      identity.getToken,
    );
    if (!completion.complete || !profile.confirmedAt) {
      return NextResponse.json({
        status: "profile_required",
        confirmed: Boolean(profile.confirmedAt),
        missing: completion.missing,
        profileVersion: profile.profileVersion,
      });
    }

    const supabase = await createAuthenticatedSupabaseClient(identity.getToken);
    const masterCv = await getOrCreateMasterCv(
      supabase,
      identity.userId,
      profile.profileVersion,
      buildMasterCvContent(profile),
    );
    return NextResponse.json({
      status: "master_cv_ready",
      profileVersion: profile.profileVersion,
      masterCv: {
        id: masterCv.id,
        versionNumber: masterCv.version_number,
        sourceProfileVersion: masterCv.source_profile_version,
        content: masterCv.content,
        templateVersion: masterCv.template_version,
        accentColour: masterCv.accent_colour,
        updatedAt: masterCv.updated_at,
      },
      isStale: false,
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return apiError("CV storage is not configured.", 503);
    }
    if (isMissingCvStorage(error)) {
      return apiError(
        "CV Studio database setup is incomplete. Apply the M4 CV versions migration, then try again.",
        503,
      );
    }
    return apiFailure(error);
  }
}
