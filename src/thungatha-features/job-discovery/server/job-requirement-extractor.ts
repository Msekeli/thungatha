import { createHash } from "node:crypto";
import {
  jobRequirementsSchema,
  type JobRequirements,
} from "./job-requirement-schema";
import { hasExactTerm, sourceSegments } from "./job-requirement-text";

type RoleFamily = NonNullable<JobRequirements["roleFamily"]>;

const ROLE_FAMILY_SIGNALS: [RoleFamily, RegExp][] = [
  ["software_it", /\\b(software|software engineer|software developer|developer|development|programmer|programming|java|python|javascript|typescript|react|angular|vue|sql|codebase|code review|unit testing|web development|frontend|front-end|backend|back-end|full.?stack|api integration|llm|rag|prompt engineering|machine learning|artificial intelligence|cloud platform|devops)\\b|(?<![A-Za-z0-9])c#(?![A-Za-z0-9])|(?<![A-Za-z0-9])c\\+\\+(?![A-Za-z0-9])|(?<![A-Za-z0-9])\\.net(?![A-Za-z0-9])|\\bnode\\.js\\b/i],
  ["engineering", /\\b(civil|mechanical|electrical|industrial|chemical) engineer(?:ing)?\\b/i],
  ["finance_accounting", /\\b(accountant|accounting|bookkeep|financial management|internal audit|auditor|payroll|taxation)\\b/i],
  ["administration", /\\b(administrator|administration|receptionist|office assistant|clerical)\\b/i],
  ["healthcare", /\\b(nurse|doctor|medical|clinical|pharmacist|healthcare)\\b/i],
  ["sales_marketing", /\\b(sales|marketing|brand management|account manager|business development)\\b/i],
  ["human_resources", /\\b(human resources|\\bhr\\b|recruitment|talent acquisition)\\b/i],
  ["operations_logistics", /\\b(logistics|warehouse|operations|supply chain|fleet management)\\b/i],
  ["education", /\\b(teacher|lecturer|educator|teaching|curriculum)\\b/i],
  ["hospitality", /\\b(hotel|hospitality|chef|waiter|restaurant)\\b/i],
  ["security", /\\b(security officer|security guard|security operations)\\b/i],
];

const SKILLS = ["C#", "C++", ".NET", "Node.js", "TypeScript", "JavaScript", "React", "Next.js", "SQL", "Python", "AWS", "Azure"];
const REQUIREMENT_CONTEXT = /\b(requirements?|must|essential|minimum|preferred|advantageous|desirable|experience|proficient|familiar|knowledge|skills?|ability to|qualification|certification|licen[cs]e|registration|fluent)\b/i;

function importance(text: string): "mandatory" | "preferred" | "uncertain" {
  if (/\b(required|must have|essential|minimum|mandatory|compulsory)\b/i.test(text)) return "mandatory";
  if (/\b(preferred|advantageous|desirable|nice to have)\b/i.test(text)) return "preferred";
  return "uncertain";
}

export function hashJobDescription(description: string) {
  return createHash("sha256").update(description).digest("hex");
}

function inferRoleFamily(description: string, title: string): RoleFamily | null {
  const weightedText = description
    .split(/\n|;|:/)
    .filter((part) => /\b(requirements?|responsibilit|duties|skills?|technology|technical|experience|qualification|you will|what you will)\b/i.test(part))
    .join(" ");
  const evidence = weightedText || description;
  const scores = ROLE_FAMILY_SIGNALS.map(([family, pattern]) => {
    const matches = evidence.match(new RegExp(pattern.source, "gi")) ?? [];
    const titleMatches = title.match(new RegExp(pattern.source, "gi")) ?? [];
    return { family, score: matches.length + titleMatches.length };
  }).sort((a, b) => b.score - a.score);
  if (!scores[0]?.score || scores[0].score === scores[1]?.score) return null;
  return scores[0].family;
}

export function extractJobRequirements(description: string, title = ""): JobRequirements {
  const segments = sourceSegments(description);
  const descriptionHash = hashJobDescription(description);
  if (segments.join(" ").length < 20) {
    return jobRequirementsSchema.parse({
      schemaVersion: 1, extractionVersion: "m3-c02-v4", descriptionHash,
      roleFamily: null, requirements: [], status: "unavailable",
    });
  }

  const requirements: JobRequirements["requirements"] = [];
  const add = (category: JobRequirements["requirements"][number]["category"], value: string, sourceText: string) => {
    if (requirements.some((item) => item.category === category && item.value.toLowerCase() === value.toLowerCase())) return;
    requirements.push({
      id: category + ":" + (requirements.length + 1),
      category, value, importance: importance(sourceText), sourceText,
      confidence: "explicit",
    });
  };

  let inRequirementList = false;
  for (const sourceText of segments) {
    const hasRequirementContext = REQUIREMENT_CONTEXT.test(sourceText);
    // Keep headings such as "Your Experience:" active for the following bullets.
    if (hasRequirementContext && /:\s*$/.test(sourceText)) inRequirementList = true;
    else if (/^(responsibilities|your experience|requirements|what you bring|what you will do|qualifications)\b/i.test(sourceText)) inRequirementList = true;
    else if (/^(about us|about the company|our company|what we offer|benefits)\b/i.test(sourceText)) inRequirementList = false;

    if (!hasRequirementContext && !inRequirementList) continue;
    for (const match of sourceText.matchAll(/(?:at least|minimum of|minimum)\s+(\d+)\s+years?\s+(?:of\s+)?(?:relevant\s+)?experience/gi)) add("experience", match[1] + " years", sourceText);
    for (const match of sourceText.matchAll(/\b(Matric|Grade 12|National Senior Certificate|NSC|diploma|degree|bachelor'?s degree|honours degree|master'?s degree)\b/gi)) add("education", match[0], sourceText);
    for (const match of sourceText.matchAll(/\b(AWS Certified [A-Za-z0-9 -]+|Microsoft Certified [A-Za-z0-9 -]+|PMP|CISSP|CompTIA [A-Za-z0-9 +]+)\b/gi)) add("certification", match[0].trim(), sourceText);
    for (const skill of SKILLS) if (hasExactTerm(sourceText, skill)) add("skill", skill, sourceText);
    for (const match of sourceText.matchAll(/\b(valid [A-Z]{1,3} driver'?s licence|driver'?s licence|professional registration|registered with [A-Z][A-Za-z ]+)\b/gi)) add("licence", match[0], sourceText);
    if (/\b(fluent in|proficient in)\b/i.test(sourceText)) {
      for (const language of ["English", "Afrikaans", "isiXhosa", "isiZulu"]) {
        if (hasExactTerm(sourceText, language)) add("language", language, sourceText);
      }
    }
  }
  return jobRequirementsSchema.parse({
    schemaVersion: 1, extractionVersion: "m3-c02-v4", descriptionHash,
    roleFamily: inferRoleFamily(description, title),
    requirements,
    status: requirements.length ? "partial" : "unavailable",
  });
}
