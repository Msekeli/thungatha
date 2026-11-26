import "server-only";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { emptyCvExtractionFields, type CvExtraction } from "./cv-extraction-types";
import { parseCvText } from "./cv-extraction-parser";

export type { CvExtraction } from "./cv-extraction-types";
export { parseCvText } from "./cv-extraction-parser";

export async function extractCv(bytes: Uint8Array): Promise<CvExtraction> {
  const warnings: string[] = [];
  let text = "";
  try {
    const parser = new PDFParse({ data: Buffer.from(bytes) });
    try {
      text = (await parser.getText({ cellSeparator: " | ", cellThreshold: 16 }))
        .text;
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error(
      "CV text extraction failed:",
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { errorType: typeof error },
    );
    return {
      status: "failed",
      extractedTextLength: 0,
      fields: emptyCvExtractionFields,
      warnings: [
        "This file could not be read. Try another PDF, or enter details manually.",
      ],
    };
  }
  const normalized = text
    .replace(/\u0000/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
  if (normalized.length < 30)
    return {
      status: "failed",
      extractedTextLength: normalized.length,
      fields: emptyCvExtractionFields,
      warnings: [
        ...warnings,
        "No readable text was found. Scanned PDFs are not supported by this text-only extraction step.",
      ],
    };
  const fields = parseCvText(normalized);
  const count = Object.values(fields).reduce(
    (total, value) =>
      total + (Array.isArray(value) ? value.length : value ? 1 : 0),
    0,
  );
  if (!count)
    warnings.push(
      "Text was extracted, but no supported profile fields were confidently identified.",
    );
  if (!fields.workExperience.length)
    warnings.push(
      "Work experience could not be confidently structured from this CV. Add or correct it in the profile editor.",
    );
  if (!fields.education.length)
    warnings.push(
      "Education could not be confidently structured from this CV. Add or correct it in the profile editor.",
    );
  return {
    status: count >= 3 ? "success" : "partial",
    extractedTextLength: normalized.length,
    fields,
    warnings,
  };
}
