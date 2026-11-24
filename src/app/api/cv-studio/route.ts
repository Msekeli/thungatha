import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import {
  getProfileCompletion,
  buildMasterCvContent,
} from "@/thungatha-features/cv-studio/server/master-cv";

const TEMPLATE_VERSION = "ats-single-column-v1";
const DEFAULT_ACCENT = "teal";
const MASTER_CV_COLUMNS =
  "id, version_number, source_profile_version, content, template_version, accent_colour, updated_at";

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

  // Postgres reports an absent relation as 42P01. PostgREST reports a table
  // missing from its schema cache as PGRST205. Both indicate that the M4
  // CV versions migration has not been applied (or the schema cache is stale).
  return code === "42P01" || code === "PGRST205";
}

async function getOrCreateMasterCv(
  supabase: Awaited<ReturnType<typeof createAuthenticatedSupabaseClient>>,
  userId: string,
  profileVersion: number,
  content: ReturnType<typeof buildMasterCvContent>,
) {
  const { data: existing, error: readError } = await supabase
    .from("cv_versions")
    .select(MASTER_CV_COLUMNS)
    .eq("user_id", userId)
    .eq("cv_kind", "master")
    .eq("status", "current")
    .maybeSingle();
  if (readError) throw readError;

  if (existing?.source_profile_version === profileVersion) return existing;

  if (existing) {
    const { error } = await supabase
      .from("cv_versions")
      .update({ status: "superseded", updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .eq("status", "current");
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("cv_versions")
    .insert({
      user_id: userId,
      cv_kind: "master",
      status: "current",
      source_profile_version: profileVersion,
      content,
      suggestions: [],
      template_version: TEMPLATE_VERSION,
      accent_colour: existing?.accent_colour ?? DEFAULT_ACCENT,
    })
    .select(MASTER_CV_COLUMNS)
    .single();

  if (!error) return data;

  // A concurrent request may have created the same current master after our first read.
  if (error.code === "23505") {
    const retry = await supabase
      .from("cv_versions")
      .select(MASTER_CV_COLUMNS)
      .eq("user_id", userId)
      .eq("cv_kind", "master")
      .eq("status", "current")
      .maybeSingle();
    if (!retry.error && retry.data?.source_profile_version === profileVersion)
      return retry.data;
  }
  throw error;
}

async function handleRequest() {
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

// Opening CV Studio creates the master CV from the confirmed Profile when needed.
export async function GET() {
  return handleRequest();
}

// Kept as an explicit refresh endpoint for Profile changes and manual recovery.
export async function POST() {
  return handleRequest();
}
