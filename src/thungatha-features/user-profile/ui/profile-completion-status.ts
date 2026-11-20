import { profileCompletionSchema } from "../server/user-profile-schema";
import type { UserProfileDto } from "../server/user-profile-schema";

export function isPersonalDetailsComplete(
  details: UserProfileDto["personalDetails"],
) {
  return profileCompletionSchema.shape.personalDetails.safeParse(details).success;
}

export function isEducationComplete(education: UserProfileDto["education"]) {
  return profileCompletionSchema.shape.education.safeParse(education).success;
}
