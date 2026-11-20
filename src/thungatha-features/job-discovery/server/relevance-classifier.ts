import type { JobRequirements } from "./job-requirement-schema";
import type { deriveCandidateFacts } from "./candidate-facts";
import { evaluateRequirement } from "./requirement-evaluator";

export type CandidateFacts = NonNullable<ReturnType<typeof deriveCandidateFacts>>;
export type RequirementOutcome = "met" | "not_met" | "cant_tell";
export type Relevance = "match" | "relevant" | "unclassified";

export type RequirementAssessment = {
  requirementId: string;
  category: string;
  value: string;
  importance: string;
  outcome: RequirementOutcome;
  jobEvidence: string;
  profileEvidence: string[];
};

type RoleFamily = NonNullable<JobRequirements["roleFamily"]>;

const FAMILY_TERMS: Record<RoleFamily, RegExp> = {
  software_it: /\b(software|developer|development|programmer|programming|web development|web developer|full.?stack|front.?end|back.?end|data analyst|data engineer|ai engineer|machine learning|artificial intelligence|devops|cloud engineer|systems analyst|it support|qa engineer|automation tester|c#|\.net|java|python|javascript|typescript|react|node\.js|sql|llm|rag|prompt engineering)\b/i,
  engineering: /\b(civil|mechanical|electrical|industrial|chemical) engineer(?:ing)?\b/i,
  finance_accounting: /\b(accountant|accounting|bookkeeper|finance|financial management|internal audit|auditor|payroll|tax)\b/i,
  administration: /\b(administrator|administration|receptionist|office assistant|clerk)\b/i,
  healthcare: /\b(nurse|doctor|medical|clinical|pharmacist|healthcare)\b/i,
  sales_marketing: /\b(sales|marketing|brand|account manager|business development)\b/i,
  human_resources: /\b(human resources|\bhr\b|recruiter|talent acquisition)\b/i,
  operations_logistics: /\b(logistics|warehouse|operations|supply chain|driver)\b/i,
  education: /\b(teacher|lecturer|educator|teaching|instructional design)\b/i,
  hospitality: /\b(hotel|hospitality|chef|waiter|restaurant)\b/i,
  security: /\b(security officer|security guard|security operations)\b/i,
};

const ADJACENT: Partial<Record<RoleFamily, RoleFamily[]>> = {
  software_it: ["engineering"],
  engineering: ["software_it", "operations_logistics"],
  finance_accounting: ["administration", "operations_logistics"],
  administration: ["finance_accounting", "human_resources"],
  human_resources: ["administration"],
  operations_logistics: ["engineering", "finance_accounting"],
};

function inferFamily(text: string): RoleFamily | null {
  const scores = (Object.entries(FAMILY_TERMS) as [RoleFamily, RegExp][])
    .map(([family, pattern]) => ({ family, score: (text.match(new RegExp(pattern.source, "gi")) ?? []).length }))
    .sort((a, b) => b.score - a.score);
  if (!scores[0]?.score || (scores[1]?.score === scores[0].score)) return null;
  return scores[0].family;
}

function candidateFamilies(candidate: CandidateFacts): Set<RoleFamily> {
  const sources = [
    candidate.nextRole ?? "",
    ...candidate.employment.map((item) => item.jobTitle),
  ];
  return new Set(sources.map(inferFamily).filter((value): value is RoleFamily => value !== null));
}

function isAligned(candidate: CandidateFacts, job: JobRequirements): boolean {
  if (!job.roleFamily) return false;
  const families = candidateFamilies(candidate);
  return [...families].some((family) =>
    family === job.roleFamily || ADJACENT[family]?.includes(job.roleFamily as RoleFamily),
  );
}

export function classifyJobRelevance(candidate: CandidateFacts | null, job: JobRequirements) {
  if (!candidate || job.status === "unavailable" || job.requirements.length === 0 || !isAligned(candidate, job)) {
    return { classification: "unclassified" as const, ruleVersion: "m3-c05-v1", requirements: [] };
  }

  const requirements = job.requirements.map((requirement) => ({
    requirementId: requirement.id,
    category: requirement.category,
    value: requirement.value,
    importance: requirement.importance,
    jobEvidence: requirement.sourceText,
    ...evaluateRequirement(candidate, requirement),
  }));

  const mandatory = requirements.filter((item) => item.importance === "mandatory");
  const allMandatoryMet = mandatory.every((item) => item.outcome === "met");
  // "partial" means extraction cannot guarantee every requirement was captured.
  // It can establish relevance, but never a definitive Match.
  const classification: Relevance =
    job.status === "complete" && allMandatoryMet ? "match" : "relevant";

  return { classification, ruleVersion: "m3-c05-v1", requirements };
}
