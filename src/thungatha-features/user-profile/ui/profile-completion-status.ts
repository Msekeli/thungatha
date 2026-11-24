import { profileCompletionSchema } from "../server/user-profile-schema";
import type { UserProfileDto } from "../server/user-profile-schema";

export function isPersonalDetailsComplete(
  details: UserProfileDto["personalDetails"],
) {
  return profileCompletionSchema.shape.personalDetails.safeParse(details)
    .success;
}

export function isEducationComplete(education: UserProfileDto["education"]) {
  return education.some(
    (item) =>
      Boolean(item.educationLevel?.trim()) &&
      Boolean(item.qualification.trim()) &&
      Boolean(item.institution.trim()),
  );
}
