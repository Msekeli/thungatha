import {
  certificationItemSchema,
  educationItemSchema,
  profileCompletionSchema,
  skillItemSchema,
  type UserProfileDto,
  workExperienceItemSchema,
} from "@/thungatha-features/user-profile/server/user-profile-schema";
import { mergeEmploymentMonths, parseEmploymentMonth } from "./candidate-fact-dates";

const SKILL_ALIASES: Record<string, string> = {
  "c#": "C#", "c sharp": "C#",
  "c++": "C++", "c plus plus": "C++",
  ".net": ".NET", dotnet: ".NET",
  "node.js": "Node.js", nodejs: "Node.js",
  typescript: "TypeScript", ts: "TypeScript",
  javascript: "JavaScript", js: "JavaScript",
  react: "React", "react.js": "React",
  "next.js": "Next.js", nextjs: "Next.js",
  sql: "SQL", python: "Python", aws: "AWS", azure: "Azure",
};

function canonicalSkill(value: string) {
  return SKILL_ALIASES[value.trim().toLowerCase().replace(/\s+/g, " ")] ?? null;
}

export function deriveCandidateFacts(profile: UserProfileDto, asOfDate: string) {
  if (!profile.confirmedAt || !profileCompletionSchema.safeParse(profile).success) return null;
  const asOfMonth = parseEmploymentMonth(asOfDate);
  if (asOfMonth === null) throw new Error("asOfDate must use YYYY-MM or YYYY-MM-DD.");

  const employment = profile.workExperience.flatMap((entry, index) => {
    const parsed = workExperienceItemSchema.safeParse(entry);
    if (!parsed.success) return [];
    const start = parseEmploymentMonth(parsed.data.startDate);
    const end = parsed.data.isCurrent
      ? asOfMonth
      : parseEmploymentMonth(parsed.data.endDate);
    return start !== null && end !== null && end >= start
      ? [{ id: parsed.data.id, jobTitle: parsed.data.jobTitle, employer: parsed.data.employer, startMonth: start, endMonth: end, sourcePath: \`workExperience[\${index}]\` }]
      : [];
  });
  const unknownEmployment = profile.workExperience.flatMap((entry, index) => {
    const parsed = workExperienceItemSchema.safeParse(entry);
    if (!parsed.success || parseEmploymentMonth(parsed.data.startDate) === null ||
      (!parsed.data.isCurrent && parseEmploymentMonth(parsed.data.endDate) === null)) {
      return [\`workExperience[\${index}]\`];
    }
    return [];
  });

  const skills = profile.skills.flatMap((value, index) => {
    const parsed = skillItemSchema.safeParse(value);
    return parsed.success ? [{
      value: parsed.data, canonical: canonicalSkill(parsed.data),
      sourcePath: \`skills[\${index}]\`,
    }] : [];
  });
  const education = profile.education.flatMap((entry, index) => {
    const parsed = educationItemSchema.safeParse(entry);
    return parsed.success ? [{ ...parsed.data, sourcePath: \`education[\${index}]\` }] : [];
  });
  const certifications = profile.certifications.flatMap((entry, index) => {
    const parsed = certificationItemSchema.safeParse(entry);
    return parsed.success ? [{ ...parsed.data, sourcePath: \`certifications[\${index}]\` }] : [];
  });

  return {
    profileVersion: profile.profileVersion,
    confirmedAt: profile.confirmedAt,
    employment,
    knownEmploymentMonths: mergeEmploymentMonths(employment),
    unknownEmploymentSourcePaths: unknownEmployment,
    skills,
    education,
    certifications,
  };
}
