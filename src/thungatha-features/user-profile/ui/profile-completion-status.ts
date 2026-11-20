import { profileCompletionSchema } from "../server/user-profile-schema";
import type { UserProfileDto } from "../server/user-profile-schema";

export function isPersonalDetailsComplete(
  details: UserProfileDto["personalDetails"],
) {
  return profileCompletionSchema.shape.personalDetails.safeParse(details).success;
}

export function isEducationEntryComplete(
  item: UserProfileDto["education"][number],
) {
  return Boolean(
    item.educationLevel?.trim() &&
    item.qualification.trim() &&
    item.institution.trim() &&
    (item.isCurrent || item.endDate?.trim()),
  );
}

export function isEducationComplete(education: UserProfileDto["education"]) {
  return education.some(isEducationEntryComplete);
}

export function hasIncompleteEducation(education: UserProfileDto["education"]) {
  return education.some((item) => !isEducationEntryComplete(item));
}
