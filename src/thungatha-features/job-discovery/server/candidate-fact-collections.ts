import {
  certificationItemSchema,
  educationItemSchema,
  languageItemSchema,
  skillItemSchema,
  workExperienceItemSchema,
} from "@/thungatha-features/user-profile/server/user-profile-schema";
import { parseEmploymentMonth } from "./candidate-fact-dates";

export function deriveEmployment(profile: { workExperience: unknown[] }, asOfMonth: number) {
  const employment = [];
  const unknownEmploymentSourcePaths = [];
  profile.workExperience.forEach((entry, index) => {
    const parsed = workExperienceItemSchema.safeParse(entry);
    if (!parsed.success) {
      unknownEmploymentSourcePaths.push(\`workExperience[\${index}]\`);
      return;
    }
    const startMonth = parseEmploymentMonth(parsed.data.startDate);
    const endMonth = parsed.data.isCurrent ? asOfMonth : parseEmploymentMonth(parsed.data.endDate);
    if (startMonth === null || endMonth === null || endMonth < startMonth) {
      unknownEmploymentSourcePaths.push(\`workExperience[\${index}]\`);
      return;
    }
    employment.push({
      id: parsed.data.id, jobTitle: parsed.data.jobTitle,
      employer: parsed.data.employer, startMonth, endMonth,
      sourcePath: \`workExperience[\${index}]\`,
    });
  });
  return { employment, unknownEmploymentSourcePaths };
}

export function deriveProfileCollections(profile: {
  skills: string[]; education: unknown[]; certifications: unknown[]; languages: string[];
}) {
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
  const languages = profile.languages.flatMap((value, index) => {
    const parsed = languageItemSchema.safeParse(value);
    return parsed.success ? [{ value: parsed.data, sourcePath: \`languages[\${index}]\` }] : [];
  });
  return { skills, education, certifications, languages };
}

const SKILL_ALIASES: Record<string, string> = {
  "c#": "C#", "c sharp": "C#", "c++": "C++", "c plus plus": "C++",
  ".net": ".NET", dotnet: ".NET", "node.js": "Node.js", nodejs: "Node.js",
  typescript: "TypeScript", ts: "TypeScript", javascript: "JavaScript",
  js: "JavaScript", react: "React", "react.js": "React",
  "next.js": "Next.js", nextjs: "Next.js", sql: "SQL", python: "Python",
  aws: "AWS", azure: "Azure",
};

function canonicalSkill(value: string) {
  return SKILL_ALIASES[value.trim().toLowerCase().replace(/\s+/g, " ")] ?? null;
}
