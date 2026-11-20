import {
  profileCompletionSchema,
  type UserProfileDto,
} from "@/thungatha-features/user-profile/server/user-profile-schema";
import { deriveEmployment, deriveProfileCollections } from "./candidate-fact-collections";
import { mergeEmploymentMonths, parseEmploymentMonth } from "./candidate-fact-dates";

export function deriveCandidateFacts(profile: UserProfileDto, asOfDate: string) {
  if (!profile.confirmedAt || !profileCompletionSchema.safeParse(profile).success) return null;
  const asOfMonth = parseEmploymentMonth(asOfDate);
  if (asOfMonth === null) throw new Error("asOfDate must use YYYY-MM or YYYY-MM-DD.");

  const { employment, unknownEmploymentSourcePaths } = deriveEmployment(profile, asOfMonth);
  return {
    profileVersion: profile.profileVersion,
    confirmedAt: profile.confirmedAt,
    nextRole: profile.nextRole,
    ...deriveProfileCollections(profile),
    employment,
    knownEmploymentMonths: mergeEmploymentMonths(employment),
    unknownEmploymentSourcePaths,
  };
}
