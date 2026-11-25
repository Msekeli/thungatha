import "server-only";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { getConfirmedCvProfile } from "./cv-profile-route-context";

export async function getCvDraftAuthContext() {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return { response, identity: null, profile: null };
  const profileContext = await getConfirmedCvProfile(identity);
  if (profileContext.response) {
    return { response: profileContext.response, identity: null, profile: null };
  }
  return { response: null, identity, profile: profileContext.profile };
}
