import "server-only";
import { NextResponse } from "next/server";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { getProfileCompletion } from "./master-cv";
import type { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";

type Identity = NonNullable<
  Awaited<ReturnType<typeof resolveProfileIdentity>>["identity"]
>;
type Profile = ReturnType<typeof mapRowToProfileDto>;
type ProfileResult =
  | { response: NextResponse; profile: null }
  | { response: null; profile: Profile };

export async function getConfirmedCvProfile(
  identity: Identity,
  createIncompleteResponse: (missing: string[]) => NextResponse = (missing) =>
    NextResponse.json(
      {
        error:
          "Complete and confirm your Profile before editing a tailored CV.",
        missing,
      },
      { status: 409 },
    ),
): Promise<ProfileResult> {
  const result = await readProfile(identity.userId, identity.getToken);
  if (result.error) throw result.error;
  const profile = mapRowToProfileDto(result.data);
  const completion = getProfileCompletion(profile);
  if (!completion.complete || !profile.confirmedAt) {
    return {
      response: createIncompleteResponse(completion.missing),
      profile: null,
    };
  }
  return { response: null, profile };
}
