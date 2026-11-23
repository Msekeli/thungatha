import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "@/thungatha-features/cv-studio/server/master-cv";
import { cvContentSchema, cvSuggestionSchema, cvAccentColourSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { cvJobContextSchema } from "@/thungatha-features/cv-studio/server/job-context-schema";

const createSchema = z.object({
  masterVersionId: z.string().uuid(),
  jobContext: cvJobContextSchema,
}).strict();

const updateSchema = z.object({
  id: z.string().uuid(),
  content: cvContentSchema,
  suggestions: z.array(cvSuggestionSchema).max(200),
  accentColour: cvAccentColourSchema,
}).strict();

async function getIdentityAndProfile() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return { response, identity: null, profile: null };
  const result = await readProfile(identity.userId, identity.getToken);
  if (result.error) throw result.error;
  const profile = mapRowToProfileDto(result.data);
  const completion = getProfileCompletion(profile);
  if (!completion.complete || !profile.confirmedAt) {
    return { response: NextResponse.json({ error: "Complete and confirm your Profile before editing a tailored CV.", missing: completion.missing }, { status: 409 }), identity: null, profile: null };
  }
  return { response: null, identity, profile };
}

export async function POST(request: Request) {
  const parsedBody = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(parsedBody);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid draft request.", 400);
  try {
    const auth = await getIdentityAndProfile();
    if (auth.response || !auth.identity || !auth.profile) return auth.response;
    const db = await createAuthenticatedSupabaseClient(auth.identity.getToken);
    const { data: master, error: masterError } = await db.from("cv_versions")
      .select("id,source_profile_version,cv_kind,status,content,template_version,accent_colour")
      .eq("id", parsed.data.masterVersionId).eq("user_id", auth.identity.userId).maybeSingle();
    if (masterError) throw masterError;
    if (!master || master.cv_kind !== "master" || master.status !== "current") return apiError("The current master CV could not be found.", 404);
    if (master.source_profile_version !== auth.profile.profileVersion) return apiError("Refresh your master CV before creating a draft.", 409);
    if (parsed.data.jobContext.jobId && parsed.data.jobContext.source !== "discovery") return apiError("The job reference is invalid.", 400);

    const job = parsed.data.jobContext;
    const snapshot = {
      title: job.title,
      company: job.company,
      location: job.location,
      sourceUrl: job.sourceUrl,
      descriptionFingerprint: job.descriptionFingerprint,
    };
    const { data, error } = await db.from("cv_versions").insert({
      user_id: auth.identity.userId,
      cv_kind: "tailored",
      status: "draft",
      parent_version_id: master.id,
      source_profile_version: auth.profile.profileVersion,
      source_job_id: job.jobId,
      source_job_snapshot: snapshot,
      content: master.content,
      suggestions: [],
      template_version: master.template_version,
      accent_colour: master.accent_colour,
    }).select("id,version_number,status,content,suggestions,accent_colour,source_job_snapshot,source_profile_version,parent_version_id").single();
    if (error) throw error;
    return NextResponse.json({ draft: data }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV Studio storage is not configured.", 503);
    return apiFailure(error);
  }
}

export async function PUT(request: Request) {
  const parsedBody = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(parsedBody);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid draft update.", 400);
  try {
    const auth = await getIdentityAndProfile();
    if (auth.response || !auth.identity || !auth.profile) return auth.response;
    const db = await createAuthenticatedSupabaseClient(auth.identity.getToken);
    const { data: existing, error: readError } = await db.from("cv_versions")
      .select("id,cv_kind,status,source_profile_version")
      .eq("id", parsed.data.id).eq("user_id", auth.identity.userId).maybeSingle();
    if (readError) throw readError;
    if (!existing || existing.cv_kind !== "tailored") return apiError("This tailored draft could not be found.", 404);
    if (existing.status !== "draft") return apiError("Only an unaccepted draft can be edited.", 409);
    if (existing.source_profile_version !== auth.profile.profileVersion) return apiError("Your Profile has changed. Refresh the master CV and start a new draft to avoid editing against stale facts.", 409);

    const { data, error } = await db.from("cv_versions").update({
      content: parsed.data.content,
      suggestions: parsed.data.suggestions,
      accent_colour: parsed.data.accentColour,
      updated_at: new Date().toISOString(),
    }).eq("id", parsed.data.id).eq("user_id", auth.identity.userId).eq("status", "draft")
      .select("id,version_number,status,content,suggestions,accent_colour,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ draft: data });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV Studio storage is not configured.", 503);
    return apiFailure(error);
  }
}
