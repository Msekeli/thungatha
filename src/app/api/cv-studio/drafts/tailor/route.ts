import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "@/thungatha-features/cv-studio/server/master-cv";
import { cvTailoringRequestSchema } from "@/thungatha-features/cv-studio/server/cv-tailoring-request-schema";
import { prepareCvTailoringDraft } from "@/thungatha-features/cv-studio/server/cv-tailoring-draft-context";
import { generateAndSaveCvTailoringDraft } from "@/thungatha-features/cv-studio/server/cv-tailoring-draft-generation";

export async function POST(request: Request) {
  const parsed = cvTailoringRequestSchema.safeParse(
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
      return apiError(
        "Complete and confirm your Profile before tailoring a CV.",
        409,
      );
    }

    const db = await createAuthenticatedSupabaseClient(identity.getToken);
    const prepared = await prepareCvTailoringDraft(
      db,
      identity,
      profile.profileVersion,
      parsed.data,
    );
    if (prepared.response) return prepared.response;
    return generateAndSaveCvTailoringDraft(
      db,
      identity.userId,
      parsed.data,
      prepared.context,
    );
  } catch (error) {
    return apiFailure(error);
  }
}
