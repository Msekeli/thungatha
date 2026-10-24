import "server-only";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";
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
  };
  warnings: string[];
};
const emptyFields = {
  fullName: null,
  email: null,
  phone: null,
  linkedinUrl: null,
  portfolioUrl: null,
  summary: null,
  skills: [] as string[],
};
function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[0]?.trim() ?? null;
}
function parseFields(text: string) {
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
    .map((line) => line.trim())
    .filter(Boolean);
  const heading = lines.findIndex((line) =>
    /^(summary|professional summary|profile|about me)$/i.test(line),
  );
  const summary =
    heading >= 0
      ? lines
          .slice(heading + 1, heading + 5)
          .filter(
            (line) =>
              !/^(experience|work experience|education|skills)$/i.test(line),
          )
          .join(" ")
          .slice(0, 1200) || null
      : null;
  const skillHeading = lines.findIndex((line) =>
    /^skills(?: and competencies)?$/i.test(line),
  );
  const skills =
    skillHeading >= 0
      ? lines
          .slice(skillHeading + 1, skillHeading + 8)
          .join(",")
          .split(/[,;|•·]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 1 && item.length < 80)
          .slice(0, 40)
      : [];
  const fullName =
    lines.find(
      (line) =>
        /^[\p{L}][\p{L}'’.-]+(?:\s+[\p{L}][\p{L}'’.-]+){1,4}$/u.test(line) &&
        !/^(curriculum vitae|professional summary|work experience|personal details)$/i.test(
          line,
        ),
    ) ?? null;
  return { fullName, email, phone, linkedinUrl, portfolioUrl, summary, skills };
}
export async function extractCv(
  bytes: Uint8Array,
  format: "pdf" | "docx",
): Promise<CvExtraction> {
  const warnings: string[] = [];
  let text = "";
  try {
    if (format === "pdf") {
      const parser = new PDFParse({ data: Buffer.from(bytes) });
      try {
        text = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } else {
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(bytes),
      });
      text = result.value;
      if (result.messages.length)
        warnings.push("Some DOCX content may not have been interpreted.");
    }
  } catch (error) {
    console.error("CV text extraction failed:", error instanceof Error ? { name: error.name, message: error.message } : { errorType: typeof error });
    return {
      status: "failed",
      extractedTextLength: 0,
      fields: emptyFields,
      warnings: [
        "This file could not be read. Try another PDF or DOCX, or enter details manually.",
      ],
    };
  }
  const normalized = text
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (normalized.length < 30)
    return {
      status: "failed",
      extractedTextLength: normalized.length,
      fields: emptyFields,
      warnings: [
        ...warnings,
        "No readable text was found. Scanned PDFs are not supported by this text-only extraction step.",
      ],
    };
  const fields = parseFields(normalized);
  const count = Object.values(fields).reduce(
    (total, value) =>
      total + (Array.isArray(value) ? value.length : value ? 1 : 0),
    0,
  );
  if (!count)
    warnings.push(
      "Text was extracted, but no supported profile fields were confidently identified.",
    );
  return {
    status: count >= 3 ? "success" : "partial",
    extractedTextLength: normalized.length,
    fields,
    warnings,
  };
}
