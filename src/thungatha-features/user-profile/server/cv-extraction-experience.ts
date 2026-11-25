import type { ExtractedExperience } from "./cv-extraction-types";
import { sectionLines } from "./cv-extraction-text";

function parseExperience(lines: string[]): ExtractedExperience[] {
  const section = sectionLines(
    lines,
    /^(work experience|professional experience|employment history|career history|professional employment|experience)$/i,
    /^(education|academic background|qualifications|skills|technical skills|expertise|certifications|projects|languages|references)$/i,
  );
  const month =
    "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const token = "(?:(?:" + month + "\\s+)?(?:19|20)\\d{2}|present|current)";
  const rangePattern = new RegExp(
    "(" + token + "\\s*(?:[-–—]|to)\\s*" + token + ")",
    "i",
  );
  const normalizeDate = (value: string) => {
    const match = value.match(
      new RegExp("^(" + month + ")\\s+((?:19|20)\\d{2})$", "i"),
    );
    if (!match) return /^(?:19|20)\d{2}$/.test(value) ? value : null;
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const number = months.indexOf(match[1].slice(0, 3).toLowerCase()) + 1;
    return match[2] + "-" + String(number).padStart(2, "0");
  };
  const parseRange = (value: string) => {
    const tokens =
      value.match(
        new RegExp(
          month + "\\s+(?:19|20)\\d{2}|(?:19|20)\\d{2}|present|current",
          "gi",
        ),
      ) ?? [];
    const dates = tokens
      .map((item) =>
        /present|current/i.test(item) ? item : normalizeDate(item),
      )
      .filter((item): item is string => Boolean(item));
    return {
      startDate: dates[0] ?? "",
      endDate: dates[1] && !/present|current/i.test(dates[1]) ? dates[1] : null,
      isCurrent: dates.some((item) => /present|current/i.test(item)),
    };
  };
  const records: Array<{ heading: string; details: string[] }> = [];
  for (let index = 0; index < section.length; index++) {
    const line = section[index].trim();
    if (!line) continue;
    if (!/^[-•·▪]/.test(line) && rangePattern.test(line)) {
      const range = line.match(rangePattern);
      const beforeDate =
        range?.index === undefined ? line : line.slice(0, range.index).trim();
      const previous = section[index - 1]?.trim();
      const previousTwo = section[index - 2]?.trim();
      const heading = beforeDate
        ? previous && !rangePattern.test(previous)
          ? `${previous} | ${line}`
          : line
        : previousTwo && previous
          ? `${previousTwo} | ${previous} | ${line}`
          : line;
      records.push({ heading, details: [] });
    } else if (records.length)
      records[records.length - 1].details.push(
        line.replace(/^[-•·▪]\s*/, "").trim(),
      );
  }
  return records
    .map<ExtractedExperience | null>((record, index) => {
      const range = record.heading.match(rangePattern);
      if (!range || range.index === undefined) return null;
      const heading = record.heading
        .slice(0, range.index)
        .replace(/[|–—-]\s*$/, "")
        .trim();
      const parts = heading
        .split(/\s+\|\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length < 2) return null;
      const jobTitle = parts[0].slice(0, 150);
      const employer = parts.slice(1).join(" | ").slice(0, 150);
      const dates = parseRange(range[1]);
      if (!jobTitle || !employer || !dates.startDate) return null;
      const description = record.details
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" ")
        .slice(0, 5000);
      return {
        id: `cv-exp-${index + 1}`,
        jobTitle,
        employer,
        startDate: dates.startDate,
        endDate: dates.endDate,
        isCurrent: dates.isCurrent,
        description: description || null,
        achievements: [],
      };
    })
    .filter((item): item is ExtractedExperience => item !== null)
    .slice(0, 30);
}
