import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";

const idSchema = z.string().uuid();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid CV version identifier.", 400);
  try {
    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data, error } = await db.from("cv_versions")
      .select("id,version_number,cv_kind,status,source_profile_version,source_job_snapshot,source_job_id,content,suggestions,template_version,accent_colour,created_at,updated_at,accepted_at")
      .eq("user_id", identity.userId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiError("This CV version could not be found.", 404);
    return NextResponse.json({ version: data });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV storage is not configured.", 503);
    return apiFailure(error);
  }
}
