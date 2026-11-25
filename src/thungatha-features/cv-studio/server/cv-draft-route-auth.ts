import "server-only";
import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "@/thungatha-features/cv-studio/server/master-cv";

export async function getCvDraftAuthContext() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return { response, identity: null, profile: null };
  const result = await readProfile(identity.userId, identity.getToken);
  if (result.error) throw result.error;
  const profile = mapRowToProfileDto(result.data);
  const completion = getProfileCompletion(profile);
  if (!completion.complete || !profile.confirmedAt) {
    return {
      response: NextResponse.json(
        {
          error: "Complete and confirm your Profile before editing a tailored CV.",
          missing: completion.missing,
        },
        { status: 409 },
      ),
      identity: null,
      profile: null,
    };
  }
  return { response: null, identity, profile };
}
