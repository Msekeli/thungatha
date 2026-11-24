import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "@/thungatha-features/cv-studio/server/master-cv";
import { cvContentSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { cvJobContextInputSchema } from "@/thungatha-features/cv-studio/server/job-context-schema";
import { resolveCvJobContext } from "@/thungatha-features/cv-studio/server/job-context-service";
import { generateCvTailoringSuggestions } from "@/thungatha-features/cv-studio/server/cv-tailoring-service";

const requestSchema = z.object({
  draftId: z.string().uuid(),
  job: cvJobContextInputSchema,
}).strict();

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message ?? "Invalid CV tailoring request.",
      400,
    );
  }

  try {
    const { identity, response } = await resolveProfileIdentity();
    if (response || !identity) return response;
    const profileResult = await readProfile(identity.userId, identity.getToken);
    if (profileResult.error) throw profileResult.error;
    const profile = mapRowToProfileDto(profileResult.data);
    const completion = getProfileCompletion(profile);
    if (!completion.complete || !profile.confirmedAt) {
      return apiError("Complete and confirm your Profile before tailoring a CV.", 409);
    }

    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data: draft, error: draftError } = await db
      .from("cv_versions")
      .select("id,status,content,cv_kind,source_profile_version,parent_version_id,source_job_snapshot,source_job_id")
      .eq("id", parsed.data.draftId)
      .eq("user_id", identity.userId)
      .maybeSingle();
    if (draftError) throw draftError;
    if (!draft || draft.cv_kind !== "tailored") {
      return apiError("This tailored draft could not be found.", 404);
    }
    if (draft.status !== "draft") {
      return apiError("Only an unaccepted draft can be tailored.", 409);
    }
    if (draft.source_profile_version !== profile.profileVersion) {
      return apiError("Your Profile has changed. Refresh the master CV and create a new draft.", 409);
    }

    const job = await resolveCvJobContext(identity.getToken, parsed.data.job);
    const snapshot = draft.source_job_snapshot as { title?: string; company?: string | null; location?: string | null; descriptionFingerprint?: string; jobId?: string | null } | null;
    if (
      snapshot?.descriptionFingerprint !== job.descriptionFingerprint ||
      snapshot.title !== job.title ||
      snapshot.company !== job.company ||
      snapshot.location !== job.location ||
      (job.jobId && draft.source_job_id !== job.jobId) ||
      (snapshot?.jobId && snapshot.jobId !== job.jobId)
    ) {
      return apiError("The job context does not match this CV draft.", 409);
    }

    if (!draft.parent_version_id) {
      return apiError("The master CV linked to this draft could not be found.", 409);
    }

    const { data: master, error: masterError } = await db
      .from("cv_versions")
      .select("id,content,cv_kind,status,source_profile_version")
      .eq("id", draft.parent_version_id)
      .eq("user_id", identity.userId)
      .maybeSingle();
    if (masterError) throw masterError;
    if (
      !master ||
      master.cv_kind !== "master" ||
      master.status !== "current" ||
      master.source_profile_version !== profile.profileVersion
    ) {
      return apiError("The current master CV could not be found.", 409);
    }

    const masterContent = cvContentSchema.parse(master.content);
    const draftContent = cvContentSchema.parse(draft.content);
    const result = await generateCvTailoringSuggestions(masterContent, draftContent, job);
    return NextResponse.json(result);
  } catch (error) {
    return apiFailure(error);
  }
}
