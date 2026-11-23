import { connection, NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { SupabaseConfigurationError } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "@/thungatha-features/cv-studio/server/master-cv";
import { cvJobContextInputSchema } from "@/thungatha-features/cv-studio/server/job-context-schema";
import { resolveCvJobContext } from "@/thungatha-features/cv-studio/server/job-context-service";

export async function POST(request: Request) {
  await connection();
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  let body: unknown;
  try { body = await request.json(); } catch { return apiError("A valid JSON request is required.", 400); }
  const parsed = cvJobContextInputSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid job context.", 400);

  try {
    const profileResult = await readProfile(identity.userId, identity.getToken);
    if (profileResult.error) throw profileResult.error;
    const profile = mapRowToProfileDto(profileResult.data);
    const completion = getProfileCompletion(profile);
    if (!completion.complete || !profile.confirmedAt) {
      return NextResponse.json({ status: "profile_required", missing: completion.missing }, { status: 409 });
    }
    const jobContext = await resolveCvJobContext(identity.userId, identity.getToken, parsed.data);
    return NextResponse.json({ status: "job_context_ready", jobContext });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV Studio storage is not configured.", 503);
    if (error instanceof Error && error.message === "URL_REQUIRES_DESCRIPTION") return apiError("Automatic URL retrieval is not enabled yet. Paste the job description to continue.", 422);
    if (error instanceof Error && error.message === "JOB_NOT_FOUND") return apiError("This job is no longer available in Job Discovery.", 404);
    if (error instanceof Error && error.message === "JOB_DESCRIPTION_INSUFFICIENT") return apiError("The job description does not contain enough detail. Paste the complete description.", 422);
    return apiFailure(error);
  }
}
