import "server-only";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { getCvDraftAuthContext } from "./cv-draft-route-auth";
import { updateCvDraftSchema } from "./cv-draft-request-schema";
import { handleCvDraftRouteError } from "./cv-draft-route-error";

export async function updateCvDraft(request: Request) {
  const parsed = updateCvDraftSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid draft update.", 400);
  }

  try {
    const auth = await getCvDraftAuthContext();
    if (auth.response || !auth.identity || !auth.profile) return auth.response;
    const db = await createAuthenticatedSupabaseClient(auth.identity.getToken);
    const { data: existing, error: readError } = await db
      .from("cv_versions")
      .select("id,cv_kind,status,source_profile_version")
      .eq("id", parsed.data.id)
      .eq("user_id", auth.identity.userId)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing || existing.cv_kind !== "tailored") {
      return apiError("This tailored draft could not be found.", 404);
    }
    if (existing.status !== "draft") {
      return apiError("Only an unaccepted draft can be edited.", 409);
    }
    if (existing.source_profile_version !== auth.profile.profileVersion) {
      return apiError(
        "Your Profile has changed. Refresh the master CV and start a new draft to avoid editing against stale facts.",
        409,
      );
    }

    const { data, error } = await db
      .from("cv_versions")
      .update({
        content: parsed.data.content,
        suggestions: parsed.data.suggestions,
        accent_colour: parsed.data.accentColour,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id)
      .eq("user_id", auth.identity.userId)
      .eq("status", "draft")
      .select(
        "id,version_number,status,content,suggestions,tailoring_assessment,accent_colour,updated_at",
      )
      .single();
    if (error) throw error;
    return NextResponse.json({ draft: data });
  } catch (error) {
    return handleCvDraftRouteError(error);
  }
}
