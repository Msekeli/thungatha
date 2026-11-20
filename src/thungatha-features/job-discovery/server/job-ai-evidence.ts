import type { UserProfileDto } from "@/thungatha-features/user-profile/server/user-profile-schema";
import { sourceSegments } from "./job-requirement-text";

export type EvidenceItem = { id: string; sourcePath: string; content: string };

export function buildJobEvidence(description: string): EvidenceItem[] {
  return sourceSegments(description).map((content, index) => ({
    id: `job:segment:${index + 1}`, sourcePath: "description", content,
  }));
}

export function buildProfileEvidence(profile: UserProfileDto): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  const add = (sourcePath: string, content: unknown) => {
    if (typeof content !== "string" || !content.trim()) return;
    items.push({ id: `profile:${sourcePath}`, sourcePath, content: content.trim() });
  };
  add("summary", profile.summary);
  add("nextRole", profile.nextRole);
  const location = [profile.personalDetails.residentialCity, profile.personalDetails.residentialProvince, profile.personalDetails.country].filter(Boolean).join(", ");
  add("location", location);
  profile.workExperience.forEach((item, index) => {
    const base = `workExperience[${index}]`;
    add(`${base}.jobTitle`, item.jobTitle);
    add(`${base}.description`, item.description);
    item.achievements?.forEach((value, achievementIndex) => add(`${base}.achievements[${achievementIndex}]`, value));
    add(`${base}.dates`, [item.startDate, item.isCurrent ? "current" : item.endDate].filter(Boolean).join(" to "));
  });
  profile.skills.forEach((value, index) => add(`skills[${index}]`, value));
  profile.education.forEach((item, index) => add(`education[${index}]`, [item.educationLevel, item.qualification, item.fieldOfStudy].filter(Boolean).join(" — ")));
  profile.certifications.forEach((item, index) => add(`certifications[${index}]`, [item.name, item.type, item.issuer, item.expiryDate ? `expires ${item.expiryDate}` : null].filter(Boolean).join(" — ")));
  profile.projects.forEach((item, index) => {
    add(`projects[${index}].name`, item.name);
    add(`projects[${index}].role`, item.role);
    add(`projects[${index}].description`, item.description);
  });
  profile.languages.forEach((value, index) => add(`languages[${index}]`, value));
  profile.personalAttributes.forEach((value, index) => add(`personalAttributes[${index}]`, value));
  return items;
}

export function assertEvidenceReferences(references: string[], allowed: Set<string>) {
  return references.every((reference) => allowed.has(reference));
}
