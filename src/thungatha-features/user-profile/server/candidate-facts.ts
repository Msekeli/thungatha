import {
  profileCompletionSchema,
  type UserProfileDto,
} from "./user-profile-schema";
import { calculateKnownEmploymentMonths } from "./employment-periods";
export type CandidateEvidence = {
  id: string;
  sourcePath: string;
  content: string;
};
export type CandidateFacts = {
  profileVersion: number;
  confirmedAt: string;
  targetRole: string | null;
  knownEmploymentMonths: number | null;
  employmentEvidenceRefs: string[];
  unknownEmploymentPeriodRefs: string[];
  evidence: CandidateEvidence[];
};
export function deriveCandidateFacts(
  profile: UserProfileDto,
  asOfDate = new Date().toISOString().slice(0, 10),
): CandidateFacts | null {
  if (
    !profile.confirmedAt ||
    !profileCompletionSchema.safeParse(profile).success
  )
    return null;
  const evidence: CandidateEvidence[] = [];
  const add = (sourcePath: string, value: unknown) => {
    if (typeof value !== "string" || !value.trim()) return;
    evidence.push({
      id: `profile:${sourcePath}`,
      sourcePath,
      content: value.trim(),
    });
  };
  add("summary", profile.summary);
  add("nextRole", profile.nextRole);
  add("personalDetails.location", profile.personalDetails.location);
  add("personalDetails.country", profile.personalDetails.country);
  add(
    "personalDetails.residentialSuburb",
    profile.personalDetails.residentialSuburb,
  );
  add(
    "personalDetails.residentialCity",
    profile.personalDetails.residentialCity,
  );
  add(
    "personalDetails.residentialProvince",
    profile.personalDetails.residentialProvince,
  );
  profile.workExperience.forEach((item, index) => {
    const path = `workExperience[${index}]`;
    add(`${path}.jobTitle`, item.jobTitle);
    add(`${path}.employer`, item.employer);
    add(`${path}.location`, item.location);
    add(`${path}.description`, item.description);
    add(`${path}.startDate`, item.startDate);
    add(`${path}.isCurrent`, item.isCurrent ? "Current role" : "Not current");
    add(`${path}.endDate`, item.endDate);
    item.achievements?.forEach((value, i) =>
      add(`${path}.achievements[${i}]`, value),
    );
  });
  profile.skills.forEach((value, i) => add(`skills[${i}]`, value));
  profile.education.forEach((item, i) => {
    const path = `education[${i}]`;
    add(`${path}.qualification`, item.qualification);
    add(`${path}.educationLevel`, item.educationLevel);
    add(`${path}.fieldOfStudy`, item.fieldOfStudy);
    add(`${path}.institution`, item.institution);
  });
  profile.certifications.forEach((item, i) => {
    const path = `certifications[${i}]`;
    add(`${path}.type`, item.type);
    add(`${path}.name`, item.name);
    add(`${path}.issuer`, item.issuer);
    add(`${path}.issueDate`, item.issueDate);
    add(`${path}.expiryDate`, item.expiryDate);
    item.licenceCategories?.forEach((value, j) =>
      add(`${path}.licenceCategories[${j}]`, value),
    );
    add(`${path}.endorsements`, item.endorsements);
  });
  profile.projects.forEach((item, i) => {
    const path = `projects[${i}]`;
    add(`${path}.name`, item.name);
    add(`${path}.role`, item.role);
    add(`${path}.description`, item.description);
  });
  profile.languages.forEach((value, i) => add(`languages[${i}]`, value));
  profile.personalAttributes.forEach((value, i) =>
    add(`personalAttributes[${i}]`, value),
  );
  const employment = calculateKnownEmploymentMonths(
    profile.workExperience,
    asOfDate,
  );
  const employmentRefs = (index: number) => {
    const path = `profile:workExperience[${index}]`;
    return [`${path}.startDate`, `${path}.isCurrent`, `${path}.endDate`].filter(
      (ref) => evidence.some((item) => item.id === ref),
    );
  };
  return {
    profileVersion: profile.profileVersion,
    confirmedAt: profile.confirmedAt,
    targetRole: profile.nextRole,
    knownEmploymentMonths: employment.knownSourceIndexes.length
      ? employment.knownMonths
      : null,
    employmentEvidenceRefs:
      employment.knownSourceIndexes.flatMap(employmentRefs),
    unknownEmploymentPeriodRefs:
      employment.unknownSourceIndexes.flatMap(employmentRefs),
    evidence,
  };
}
