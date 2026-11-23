import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion, buildMasterCvContent } from "@/thungatha-features/cv-studio/server/master-cv";

const TEMPLATE_VERSION = "ats-single-column-v1";
const DEFAULT_ACCENT = "teal";

async function loadProfile(userId: string, getToken: () => Promise<string | null>) {
  const { data, error } = await readProfile(userId, getToken);
  if (error) throw error;
  const profile = mapRowToProfileDto(data);
  return { profile, completion: getProfileCompletion(profile) };
}

export async function GET() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  try {
    const { profile, completion } = await loadProfile(identity.userId, identity.getToken);
    if (!completion.complete || !profile.confirmedAt) {
      return NextResponse.json({ status: "profile_required", confirmed: Boolean(profile.confirmedAt), missing: completion.missing, profileVersion: profile.profileVersion });
    }
    const supabase = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data, error } = await supabase.from("cv_versions")
      .select("id, version_number, source_profile_version, content, template_version, accent_colour, updated_at")
      .eq("user_id", identity.userId).eq("cv_kind", "master").eq("status", "current").maybeSingle();
    if (error) throw error;
    const current = data && data.source_profile_version === profile.profileVersion ? data : null;
    return NextResponse.json({
      status: "master_cv_ready",
      profileVersion: profile.profileVersion,
      masterCv: current ? {
        id: current.id, versionNumber: current.version_number,
        sourceProfileVersion: current.source_profile_version, content: current.content,
        templateVersion: current.template_version, accentColour: current.accent_colour,
        updatedAt: current.updated_at,
      } : null,
      isStale: Boolean(data && data.source_profile_version !== profile.profileVersion),
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV storage is not configured", 503);
    return apiFailure(error);
  }
}

export async function POST() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  try {
    const { profile, completion } = await loadProfile(identity.userId, identity.getToken);
    if (!completion.complete || !profile.confirmedAt) {
      return NextResponse.json({ status: "profile_required", confirmed: Boolean(profile.confirmedAt), missing: completion.missing, profileVersion: profile.profileVersion }, { status: 409 });
    }
    const content = buildMasterCvContent(profile);
    const supabase = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data: existing, error: readError } = await supabase.from("cv_versions")
      .select("id, version_number, source_profile_version, content, template_version, accent_colour, updated_at")
      .eq("user_id", identity.userId).eq("cv_kind", "master").eq("status", "current").maybeSingle();
    if (readError) throw readError;
    if (existing && existing.source_profile_version === profile.profileVersion) {
      return NextResponse.json({ status: "master_cv_ready", masterCv: existing });
    }
    if (existing) {
      const { error } = await supabase.from("cv_versions")
        .update({ status: "superseded", updated_at: new Date().toISOString() })
        .eq("id", existing.id).eq("user_id", identity.userId).eq("status", "current");
      if (error) throw error;
    }
    const { data, error } = await supabase.from("cv_versions").insert({
      user_id: identity.userId, cv_kind: "master", status: "current",
      source_profile_version: profile.profileVersion, content, suggestions: [],
      template_version: TEMPLATE_VERSION, accent_colour: existing?.accent_colour ?? DEFAULT_ACCENT,
    }).select("id, version_number, source_profile_version, content, template_version, accent_colour, updated_at").single();
    if (error) throw error;
    return NextResponse.json({ status: "master_cv_ready", masterCv: data }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV storage is not configured", 503);
    return apiFailure(error);
  }
}
