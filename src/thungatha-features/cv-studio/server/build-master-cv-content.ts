import "server-only";
import { cvContentSchema, type CvContent } from "./cv-studio-schema";
import type { UserProfileDto } from "@/thungatha-features/user-profile/server/user-profile-schema";

export function buildMasterCvContent(profile: UserProfileDto): CvContent {
  const details = profile.personalDetails;
  const location =
    [
      details.residentialSuburb,
      details.residentialCity,
      details.residentialProvince,
      details.country,
    ]
      .filter(Boolean)
      .join(", ") || details.location;

  return cvContentSchema.parse({
    fullName: details.fullName,
    headline: profile.nextRole,
    email: details.email,
    phone: details.phone,
    location: location ?? null,
    linkedinUrl: details.linkedinUrl ?? null,
    portfolioUrl: details.portfolioUrl ?? null,
    professionalSummary: profile.summary,
    workExperience: profile.workExperience.map((item) => ({
      sourceId: item.id,
      jobTitle: item.jobTitle,
      employer: item.employer,
      location: item.location ?? null,
      startDate: item.startDate,
      endDate: item.endDate ?? null,
      isCurrent: item.isCurrent,
      description: item.description ?? null,
      achievements: item.achievements ?? [],
    })),
    projects: profile.projects.map((item) => ({
      sourceId: item.id,
      name: item.name,
      role: item.role ?? null,
      description: item.description ?? null,
      url: item.url ?? null,
    })),
    technicalSkills: profile.skills,
    education: profile.education.map((item) => ({
      sourceId: item.id,
      educationLevel: item.educationLevel ?? null,
      qualification: item.qualification,
      institution: item.institution,
      fieldOfStudy: item.fieldOfStudy ?? null,
      startDate: item.startDate ?? null,
      endDate: item.endDate ?? null,
      isCurrent: item.isCurrent,
    })),
    certifications: profile.certifications.map((item) => ({
      sourceId: item.id,
      type: item.type ?? null,
      name: item.name,
      issuer: item.issuer ?? null,
      issueDate: item.issueDate ?? null,
      expiryDate: item.expiryDate ?? null,
      issuingCountry: item.issuingCountry ?? null,
      licenceCategories: item.licenceCategories ?? [],
      endorsements: item.endorsements ?? null,
    })),
    languages: profile.languages,
  });
}
