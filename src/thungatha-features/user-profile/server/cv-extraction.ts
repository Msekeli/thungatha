import "server-only";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";

type ExtractedExperience = {
  id: string;
  jobTitle: string;
  employer: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  achievements: string[];
};
type ExtractedEducation = {
  id: string;
  qualification: string;
  institution: string;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};
export type CvExtraction = {
  status: "success" | "partial" | "failed";
  extractedTextLength: number;
  fields: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    summary: string | null;
    skills: string[];
    workExperience: ExtractedExperience[];
    education: ExtractedEducation[];
  };
  warnings: string[];
};
const emptyFields: CvExtraction["fields"] = {
  fullName: null, email: null, phone: null, linkedinUrl: null,
  portfolioUrl: null, summary: null, skills: [], workExperience: [], education: [],
};
function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[0]?.trim() ?? null;
}
function sectionLines(lines: string[], headings: RegExp, stops: RegExp) {
  const start = lines.findIndex((line) => headings.test(line));
  if (start < 0) return [];
  const endOffset = lines.slice(start + 1).findIndex((line) => stops.test(line));
  return lines.slice(start + 1, endOffset < 0 ? undefined : start + 1 + endOffset);
}
function parseExperience(lines: string[]): ExtractedExperience[] {
  const section = sectionLines(
    lines,
    /^(work experience|professional experience|employment history|career history|experience)$/i,
    /^(education|academic background|qualifications|skills|technical skills|certifications|projects|languages)$/i,
  );
  const month = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const token = "(?:" + month + "\\s+)?(?:19|20)\\d{2}|present|current";
  const rangePattern = new RegExp("(" + token + "\\s*(?:[-–—]|to)\\s*" + token + ")", "i");
  const normalizeDate = (value: string) => {
    const match = value.match(new RegExp("^(" + month + ")\\s+((?:19|20)\\d{2})$", "i"));
    if (!match) return /^(?:19|20)\\d{2}$/.test(value) ? value : null;
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const number = months.indexOf(match[1].slice(0, 3).toLowerCase()) + 1;
    return match[2] + "-" + String(number).padStart(2, "0");
  };
  const parseRange = (value: string) => {
    const tokens = value.match(new RegExp(month + "\\s+(?:19|20)\\d{2}|(?:19|20)\\d{2}|present|current", "gi")) ?? [];
    const dates = tokens.map((item) => /present|current/i.test(item) ? item : normalizeDate(item)).filter((item): item is string => Boolean(item));
    return { startDate: dates[0] ?? "", endDate: dates[1] && !/present|current/i.test(dates[1]) ? dates[1] : null, isCurrent: dates.some((item) => /present|current/i.test(item)) };
  };
  const records: Array<{ heading: string; details: string[] }> = [];
  for (const rawLine of section) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!/^[-•·▪]/.test(line) && rangePattern.test(line)) records.push({ heading: line, details: [] });
    else if (records.length) records[records.length - 1].details.push(line.replace(/^[-•·▪]\\s*/, "").trim());
  }
  return records.map((record, index) => {
    const range = record.heading.match(rangePattern);
    if (!range || range.index === undefined) return null;
    const heading = record.heading.slice(0, range.index).replace(/[|–—-]\\s*$/, "").trim();
    const parts = heading.split(/\\s+\\|\\s+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const jobTitle = parts[0].slice(0, 150);
    const employer = parts.slice(1).join(" | ").slice(0, 150);
    const dates = parseRange(range[1]);
    if (!jobTitle || !employer || !dates.startDate) return null;
    const description = record.details.map((line) => line.replace(/\\s+/g, " ").trim()).filter(Boolean).join(" ").slice(0, 5000);
    return { id: `cv-exp-${index + 1}`, jobTitle, employer, startDate: dates.startDate, endDate: dates.endDate, isCurrent: dates.isCurrent, description: description || null, achievements: [] };
  }).filter((item): item is ExtractedExperience => item !== null).slice(0, 30);
}
function parseEducation(lines: string[]): ExtractedEducation[] {
  const section = sectionLines(
    lines,
    /^(education|academic background|qualifications|educational background)$/i,
    /^(work experience|professional experience|employment history|experience|skills|technical skills|certifications|projects|languages|references)$/i,
  );
  return section.map((line, index) => {
    const parts = line.split(/\s+(?:at|@|\||—|–)\s+/i);
    const qualification = (parts[0] || "").trim();
    const institution = (parts[1] || "").trim();
    if (!institution || !qualification || qualification.length > 150 || institution.length > 150) return null;
    const dates = line.match(/(?:19|20)\d{2}/g) || [];
    return {
      id: `cv-edu-${index + 1}`, qualification, institution,
      startDate: dates[0] || null, endDate: dates[1] || null,
    };
  }).filter((item): item is ExtractedEducation => item !== null).slice(0, 30);
}
function parseFields(text: string): CvExtraction["fields"] {
  const email = firstMatch(text, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phone = firstMatch(text, /(?:\+?\d[\d\s().-]{7,}\d)/);
  const linkedinUrl = firstMatch(text, /https?:\/\/(?:www\.)?linkedin\.com\/[\w/.-]+/i);
  const urls = text.match(/https?:\/\/[\w.-]+(?:\/[\w./?%&=+-]*)?/gi) ?? [];
  const portfolioUrl = urls.find((url) => !/linkedin\.com/i.test(url)) ?? null;
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const summaryLines = sectionLines(lines, /^(summary|professional summary|profile|about me|career profile)$/i, /^(experience|work experience|professional experience|education|skills|technical skills|certifications|projects|languages)$/i);
  const summary = summaryLines.join(" ").slice(0, 1200) || null;
  const skillLines = sectionLines(lines, /^skills(?: and competencies| and technologies| and tools| summary)?$/i, /^(experience|work experience|professional experience|education|certifications|projects|languages|references)$/i);
  const skills = skillLines.join(",").split(/[,;|•·]/).map((item) => item.trim()).filter((item) => item.length > 1 && item.length < 80).slice(0, 40);
  const fullName = lines.find((line) =>
    /^[\p{L}][\p{L}'’.-]+(?:\s+[\p{L}][\p{L}'’.-]+){1,4}$/u.test(line) &&
    !/^(curriculum vitae|professional summary|work experience|personal details)$/i.test(line),
  ) ?? null;
  return { fullName, email, phone, linkedinUrl, portfolioUrl, summary, skills, workExperience: parseExperience(lines), education: parseEducation(lines) };
}
export async function extractCv(bytes: Uint8Array, format: "pdf" | "docx"): Promise<CvExtraction> {
  const warnings: string[] = [];
  let text = "";
  try {
    if (format === "pdf") {
      const parser = new PDFParse({ data: Buffer.from(bytes) });
      try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
    } else {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
      text = result.value;
      if (result.messages.length) warnings.push("Some DOCX content may not have been interpreted.");
    }
  } catch (error) {
    console.error("CV text extraction failed:", error instanceof Error ? { name: error.name, message: error.message } : { errorType: typeof error });
    return { status: "failed", extractedTextLength: 0, fields: emptyFields, warnings: ["This file could not be read. Try another PDF or DOCX, or enter details manually."] };
  }
  const normalized = text.replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").trim();
  if (normalized.length < 30) return {
    status: "failed", extractedTextLength: normalized.length, fields: emptyFields,
    warnings: [...warnings, "No readable text was found. Scanned PDFs are not supported by this text-only extraction step."],
  };
  const fields = parseFields(normalized);
  const count = Object.values(fields).reduce((total, value) => total + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
  if (!count) warnings.push("Text was extracted, but no supported profile fields were confidently identified.");
  if (!fields.workExperience.length) warnings.push("Work experience could not be confidently structured from this CV. Add or correct it in the profile editor.");
  if (!fields.education.length) warnings.push("Education could not be confidently structured from this CV. Add or correct it in the profile editor.");
  return { status: count >= 3 ? "success" : "partial", extractedTextLength: normalized.length, fields, warnings };
}
