import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";

export async function GET() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;

  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data, error } = await db
      .from("cv_versions")
      .select(
        "id,cv_kind,status,version_number,content,accent_colour,source_job_snapshot,source_profile_version,updated_at,accepted_at,template_version",
      )
      .eq("user_id", identity.userId)
      .in("status", ["current", "accepted"])
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ versions: data ?? [] });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("CV storage is not configured.", 503);
    return apiFailure(error);
  }
}
