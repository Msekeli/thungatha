import type { CvExtraction } from "./cv-extraction-types";
import { firstMatch, sectionLines } from "./cv-extraction-text";
import { parseExperience } from "./cv-extraction-experience";
import { parseEducation } from "./cv-extraction-education";

export function parseCvText(text: string): CvExtraction["fields"] {
  const email = firstMatch(text, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phone = firstMatch(text, /(?:\+?\d[\d\s().-]{7,}\d)/);
  const linkedinUrl = firstMatch(
    text,
    /https?:\/\/(?:www\.)?linkedin\.com\/[\w/.-]+/i,
  );
  const urls = text.match(/https?:\/\/[\w.-]+(?:\/[\w./?%&=+-]*)?/gi) ?? [];
  const portfolioUrl = urls.find((url) => !/linkedin\.com/i.test(url)) ?? null;
  const lines = text
    .split(/\r?\n/)
    .flatMap((line) => line.split(/\s+\|\s+/))
    .map((line) => line.trim())
    .filter(Boolean);
  const summaryLines = sectionLines(
    lines,
    /^(summary|professional summary|profile|about me|career profile)$/i,
    /^(experience|work experience|professional experience|education|skills|technical skills|expertise|certifications|projects|languages)$/i,
  );
  const summary = summaryLines.join(" ").slice(0, 1200) || null;
  const skillLines = sectionLines(
    lines,
    /^(?:skills|expertise|core competencies|technical skills)(?: and competencies| and technologies| and tools| summary)?$/i,
    /^(experience|work experience|professional experience|education|certifications|projects|languages|references)$/i,
  );
  const skills = skillLines
    .join(",")
    .split(/[,;|•·]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item.length < 80)
    .slice(0, 40);
  const fullName =
    lines.find(
      (line) =>
        /^[\p{L}][\p{L}'’.-]+(?:\s+[\p{L}][\p{L}'’.-]+){1,4}$/u.test(line) &&
        !/^(curriculum vitae|professional summary|work experience|personal details)$/i.test(
          line,
        ),
    ) ?? null;
  return {
    fullName,
    email,
    phone,
    linkedinUrl,
    portfolioUrl,
    summary,
    skills,
    workExperience: parseExperience(lines),
    education: parseEducation(lines),
  };
}
