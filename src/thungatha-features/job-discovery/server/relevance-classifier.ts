import type { JobRequirements } from "./job-requirement-schema";
import type { deriveCandidateFacts } from "./candidate-facts";
import { evaluateRequirement } from "./requirement-evaluator";

export type CandidateFacts = NonNullable<ReturnType<typeof deriveCandidateFacts>>;
export type RequirementOutcome = "met" | "not_met" | "cant_tell";
export type Relevance = "relevant" | "partially_relevant" | "unclassified";

export type RequirementAssessment = {
  requirementId: string;
  category: string;
  value: string;
  importance: string;
  outcome: RequirementOutcome;
  jobEvidence: string;
  profileEvidence: string[];
};

export function classifyJobRelevance(
  candidate: CandidateFacts | null,
  job: JobRequirements,
) {
  if (!candidate || job.status === "unavailable" || job.requirements.length === 0) {
    return { classification: "unclassified" as const, ruleVersion: "m3-c04-v1", requirements: [] };
  }

  const requirements = job.requirements.map((requirement) => ({
    requirementId: requirement.id,
    category: requirement.category,
    value: requirement.value,
    importance: requirement.importance,
    jobEvidence: requirement.sourceText,
    ...evaluateRequirement(candidate, requirement),
  }));
  const positive = requirements.some((item) => item.outcome === "met");
  const mandatory = requirements.filter((item) => item.importance === "mandatory");
  const mandatoryMet = mandatory.every((item) => item.outcome === "met");
  const mandatoryUncertain = mandatory.some((item) => item.outcome === "cant_tell");

  let classification: Relevance = "unclassified";
  if (positive && mandatoryMet) classification = "relevant";
  else if (positive && (mandatoryUncertain || mandatory.some((item) => item.outcome === "not_met"))) {
    classification = "partially_relevant";
  }
  return { classification, ruleVersion: "m3-c04-v1", requirements };
}
