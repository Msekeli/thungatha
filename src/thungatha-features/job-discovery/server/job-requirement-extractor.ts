import { createHash } from "node:crypto";
import {
  jobRequirementsSchema,
  type JobRequirements,
} from "./job-requirement-schema";
import { hasExactTerm, sourceSegments } from "./job-requirement-text";

type RoleFamily = NonNullable<JobRequirements["roleFamily"]>;

const ROLE_FAMILY_SIGNALS: [RoleFamily, RegExp][] = [
  ["software_it", /\b(c#|c\+\+|\.net|java|python|javascript|typescript|react|angular|vue|node\.js|sql|programming|codebase|code review|unit testing|software development|web development|frontend|front-end|backend|back-end|full.?stack|api integration|llm|rag|prompt engineering|machine learning|artificial intelligence|cloud platform|devops)\b/i],
  ["engineering", /\b(civil|mechanical|electrical|industrial|chemical) engineer(?:ing)?\b/i],
  ["finance_accounting", /\b(accountant|accounting|bookkeep|financial management|internal audit|auditor|payroll|taxation)\b/i],
  ["administration", /\b(administrator|administration|receptionist|office assistant|clerical)\b/i],
  ["healthcare", /\b(nurse|doctor|medical|clinical|pharmacist|healthcare)\b/i],
  ["sales_marketing", /\b(sales|marketing|brand management|account manager|business development)\b/i],
  ["human_resources", /\b(human resources|\bhr\b|recruitment|talent acquisition)\b/i],
  ["operations_logistics", /\b(logistics|warehouse|operations|supply chain|fleet management)\b/i],
  ["education", /\b(teacher|lecturer|educator|teaching|curriculum)\b/i],
  ["hospitality", /\b(hotel|hospitality|chef|waiter|restaurant)\b/i],
  ["security", /\b(security officer|security guard|security operations)\b/i],
];

function inferRoleFamily(description: string, title: string): RoleFamily | null {
  const weightedText = description
    .split(/\n|\.|;|:/)
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
