import type { ExtractedEducation } from "./cv-extraction-types";
import { sectionLines } from "./cv-extraction-text";

export function parseEducation(lines: string[]): ExtractedEducation[] {
  const section = sectionLines(
    lines,
    /^(education|academic background|qualifications|educational background)$/i,
    /^(work experience|professional experience|employment history|experience|skills|technical skills|expertise|certifications|projects|languages|references)$/i,
  );
  const records: ExtractedEducation[] = [];
  for (let index = 0; index < section.length; index++) {
    const line = section[index].trim();
    const dates = line.match(/(?:19|20)\d{2}/g) || [];
    if (!dates.length) continue;
    const qualification = line
      .replace(
        /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)?\s*(?:19|20)\d{2}/gi,
        "",
      )
      .replace(/[-–—]/g, " ")
      .trim();
    const previous = section[index - 1]?.trim();
    const previousTwo = section[index - 2]?.trim();
    const next = section[index + 1]?.trim();
    const institution = qualification
      ? next && !/^id\s*:/i.test(next)
        ? next
        : ""
      : previousTwo || "";
    const resolvedQualification = qualification || previous || "";
    if (!resolvedQualification || !institution) continue;
    if (resolvedQualification.length > 150 || institution.length > 150)
      continue;
    records.push({
      id: `cv-edu-${records.length + 1}`,
      qualification: resolvedQualification,
      institution,
      startDate: dates[0] || null,
      endDate: dates[1] || null,
    });
  }
  return records.slice(0, 30);
}
