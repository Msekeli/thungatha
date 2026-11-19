import { createHash } from "node:crypto";
import {
  jobRequirementsSchema,
  type JobRequirements,
} from "./job-requirement-schema";
import { hasExactTerm, sourceSegments } from "./job-requirement-text";

const ROLE_FAMILIES: [JobRequirements["roleFamily"], RegExp][] = [
  ["software_it", /\\b(software|developer|programmer|IT support|systems analyst|data analyst|network engineer)\\b/i],
  ["engineering", /\\b(engineer|engineering|technician)\\b/i],
  ["finance_accounting", /\\b(accountant|bookkeeper|finance|auditor|payroll)\\b/i],
  ["administration", /\\b(administrator|receptionist|office assistant|clerk)\\b/i],
  ["healthcare", /\\b(nurse|doctor|medical|clinical|pharmacist)\\b/i],
  ["sales_marketing", /\\b(sales|marketing|brand|account manager)\\b/i],
  ["human_resources", /\\b(human resources|\\bHR\\b|recruiter)\\b/i],
  ["operations_logistics", /\\b(logistics|warehouse|operations|supply chain|driver)\\b/i],
  ["education", /\\b(teacher|lecturer|educator|teaching)\\b/i],
  ["hospitality", /\\b(hotel|hospitality|chef|waiter|restaurant)\\b/i],
  ["security", /\\b(security officer|security guard)\\b/i],
];

const SKILLS = ["C#", "C++", ".NET", "Node.js", "TypeScript", "JavaScript", "React", "Next.js", "SQL", "Python", "AWS", "Azure"];
const REQUIREMENT_CONTEXT = /\\b(requirements?|must|essential|minimum|preferred|advantageous|desirable|experience|proficient|familiar|knowledge|skills?|ability to|qualification|certification|licen[cs]e|registration|fluent)\\b/i;

function importance(text: string): "mandatory" | "preferred" | "uncertain" {
  if (/\\b(required|must have|essential|minimum|mandatory|compulsory)\\b/i.test(text)) return "mandatory";
  if (/\\b(preferred|advantageous|desirable|nice to have)\\b/i.test(text)) return "preferred";
  return "uncertain";
}

export function hashJobDescription(description: string) {
  return createHash("sha256").update(description).digest("hex");
}

export function extractJobRequirements(description: string, title = ""): JobRequirements {
  const segments = sourceSegments(description);
  const descriptionHash = hashJobDescription(description);
  if (segments.join(" ").length < 20) {
    return jobRequirementsSchema.parse({
      schemaVersion: 1, extractionVersion: "m3-c02-v1", descriptionHash,
      roleFamily: null, requirements: [], status: "unavailable",
    });
  }

  const requirements: JobRequirements["requirements"] = [];
  const add = (category: JobRequirements["requirements"][number]["category"], value: string, sourceText: string) => {
    if (requirements.some((item) => item.category === category && item.value.toLowerCase() === value.toLowerCase())) return;
    requirements.push({
      id: `${category}:${requirements.length + 1}`,
      category, value, importance: importance(sourceText), sourceText,
      confidence: "explicit",
    });
  };

  for (const sourceText of segments) {
    if (!REQUIREMENT_CONTEXT.test(sourceText)) continue;
    for (const match of sourceText.matchAll(/(?:at least|minimum of|minimum)\\s+(\\d+)\\s+years?\\s+(?:of\\s+)?(?:relevant\\s+)?experience/gi)) add("experience", `${match[1]} years`, sourceText);
    for (const match of sourceText.matchAll(/\\b(Matric|Grade 12|National Senior Certificate|NSC|diploma|degree|bachelor'?s degree|honours degree|master'?s degree)\\b/gi)) add("education", match[0], sourceText);
    for (const match of sourceText.matchAll(/\\b(AWS Certified [A-Za-z0-9 -]+|Microsoft Certified [A-Za-z0-9 -]+|PMP|CISSP|CompTIA [A-Za-z0-9 +]+)\\b/gi)) add("certification", match[0].trim(), sourceText);
    for (const skill of SKILLS) if (hasExactTerm(sourceText, skill)) add("skill", skill, sourceText);
    for (const match of sourceText.matchAll(/\\b(valid [A-Z]{1,3} driver'?s licence|driver'?s licence|professional registration|registered with [A-Z][A-Za-z ]+)\\b/gi)) add("licence", match[0], sourceText);
    if (/\\b(fluent in|proficient in)\\b/i.test(sourceText)) {
      for (const language of ["English", "Afrikaans", "isiXhosa", "isiZulu"]) {
        if (hasExactTerm(sourceText, language)) add("language", language, sourceText);
      }
    }
  }

  const roleFamily = ROLE_FAMILIES.find(([, pattern]) => pattern.test(title))?.[0] ?? null;
  return jobRequirementsSchema.parse({
    schemaVersion: 1, extractionVersion: "m3-c02-v1", descriptionHash,
    roleFamily, requirements, status: requirements.length ? "partial" : "unavailable",
  });
}
