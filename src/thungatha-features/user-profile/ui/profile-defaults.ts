import type { UserProfileDto } from "../server/user-profile-schema";

export const createBlankProfile = (): UserProfileDto => ({
  displayName: null,
  nextRole: null,
  personalDetails: {
    fullName: null,
    email: null,
    phone: null,
    location: null,
    country: null,
    residentialSuburb: null,
    residentialCity: null,
    residentialProvince: null,
    residentialPostalCode: null,
    linkedinUrl: null,
    portfolioUrl: null,
  },
  summary: null,
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  personalAttributes: [],
  masterCv: null,
  confirmedAt: null,
  profileVersion: 1,
});

export function isProfileEmpty(p: UserProfileDto | null): boolean {
  if (!p) return true;
  const d = p.personalDetails;
  return (
    !p.displayName &&
    !p.nextRole &&
    !d.fullName &&
    !d.email &&
    !d.phone &&
    !d.location &&
    !d.country &&
    !d.residentialSuburb &&
    !d.residentialCity &&
    !d.residentialProvince &&
    !d.residentialPostalCode &&
    !d.linkedinUrl &&
    !d.portfolioUrl &&
    !p.summary &&
    p.workExperience.length === 0 &&
    p.education.length === 0 &&
    p.skills.length === 0 &&
    p.certifications.length === 0 &&
    p.projects.length === 0 &&
    p.languages.length === 0 &&
    p.personalAttributes.length === 0
  );
}
