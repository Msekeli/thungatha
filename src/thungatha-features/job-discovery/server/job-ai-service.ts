import "server-only";
import { completeAiTask } from "@/lib/ai/provider-router";
import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import {
  assertEvidenceReferences,
  buildJobEvidence,
  buildProfileEvidence,
} from "./job-ai-evidence";
import {
  jobUnderstandingSchema,
  matchAssessmentInputSchema,
  type JobUnderstanding,
} from "./job-ai-schemas";
import { validateAndClassifyAssessment } from "./job-ai-classification";

const json = (value: unknown) => JSON.stringify(value);

function parse<T>(
  content: string,
  schema: { parse: (value: unknown) => T },
): T {
  try {
    return schema.parse(JSON.parse(content));
  } catch (cause) {
    throw new Error("AI returned output that failed the matching schema.", {
      cause,
    });
  }
}

export async function understandJobWithAi(description: string) {
  const evidence = buildJobEvidence(description);
  if (evidence.length === 0) {
    throw new Error("The job description does not contain enough readable text.");
  }

  const response = await completeAiTask({
    task: "job-requirement-extraction",
    responseFormat: "json",
    temperature: 0.1,
    maxOutputTokens: 2800,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Understand the complete job advert in context, not just its title or familiar keywords.",
      "Identify only material responsibilities, capabilities, and requirements that affect the actual work or candidate suitability.",
      "Preserve semantic meaning, equivalent terminology, transferable work context, and explicit versus uncertain wording.",
      "Combine duplicate or closely related items. Do not produce exhaustive paraphrases, generic soft skills, benefits, or boilerplate.",
      "Return at most 12 responsibilities, 16 capabilities, and 24 material requirements. If the advert contains more material information than fits, mark coverage partial rather than silently implying completeness.",
      "Every item must cite one or more exact supplied job evidence IDs. Never infer a requirement that the advert does not support.",
      "Classify requirement importance as mandatory, preferred, or uncertain using the context of the full advert, not isolated keyword triggers.",
      "Keep each statement concise. Return a short role-purpose summary.",
      'Return JSON: {summary:string,responsibilities:[{id,statement,sourceEvidenceRefs}],capabilities:[{id,name,context,sourceEvidenceRefs}],requirements:[{id,statement,category,importance,sourceEvidenceRefs}],coverage:"complete"|"partial"|"unavailable"}.',
      "Requirement categories: experience, skill, technology, qualification, certification, licence, language, location, work_mode, other.",
      "Return only valid JSON. No scores, percentages, role-family labels, or hiring predictions.",
    ].join("\n"),
    userPrompt: json({ sourceEvidence: evidence }),
  });

  const result = parse(response.content, jobUnderstandingSchema);
  const allowed = new Set(evidence.map((item) => item.id));
  const refs = [
    ...result.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ];
  if (!assertEvidenceReferences(refs, allowed)) {
    throw new Error("AI job understanding referenced text that is not in the supplied job description.");
  }

  return { analysis: result, provider: response.provider, model: response.model };
}

export async function assessJobWithAi(
  title: string,
  understanding: JobUnderstanding,
  description: string,
  facts: CandidateFacts,
) {
  const allJobEvidence = buildJobEvidence(description);
  const referencedJobIds = new Set([
    ...understanding.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const referencedJobEvidence = allJobEvidence.filter((item) => referencedJobIds.has(item.id));
  // If understanding could not extract material items, retain a small source
  // sample so the assessment can safely return Unclassified instead of retrying forever.
  const jobEvidence = referencedJobEvidence.length
    ? referencedJobEvidence
    : allJobEvidence.slice(0, 3);
  const profileEvidence = buildProfileEvidence(facts);

  if (!jobEvidence.length || !profileEvidence.length) {
    throw new Error("There is insufficient evidence to assess this role.");
  }

  const compactUnderstanding = {
    coverage: understanding.coverage,
    responsibilities: understanding.responsibilities,
    capabilities: understanding.capabilities,
    requirements: understanding.requirements,
  };

  const response = await completeAiTask({
    task: "job-fit-assessment",
    responseFormat: "json",
    temperature: 0.1,
    maxOutputTokens: 2800,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Compare the actual work and material requirements with the candidate's confirmed Profile evidence.",
      "Recognise equivalent responsibilities across different titles and transferable capabilities across contexts when the evidence supports the relationship. Titles are context, never gates.",
      "Treat target-role preference as soft context only, never as proof of a skill or experience.",
      "Missing Profile information means not demonstrated, not proof that the candidate lacks the capability.",
      "Use only supplied jobEvidence and confirmedProfileEvidence IDs. Cite exact IDs for every factual claim.",
      "Assess every extracted requirement exactly once, preserving its exact id, wording, and importance. Do not add, omit, duplicate, or reclassify requirements. If no material requirements or responsibilities were extracted, return insufficient alignment and do not infer candidate fit.",
      "A supported requirement must cite confirmed Profile evidence. Every requirement must cite job evidence.",
      "Explain material gaps and uncertainty concisely. Do not calculate scores, percentages, weights, rankings, or hiring predictions.",
      "Return semanticAlignment as strong, meaningful, or insufficient and state whether material gaps remain. Application code derives Match, Relevant, or Unclassified.",
      'Return JSON: {semanticAlignment:{level:"strong"|"meaningful"|"insufficient",materialGaps:boolean,jobEvidenceRefs:string[],profileEvidenceRefs:string[]},summary:string,alignmentExplanation:string,requirements:[{id,requirement,importance,assessment:"supported"|"not_demonstrated"|"contradictory"|"uncertain",explanation,jobEvidenceRefs,profileEvidenceRefs}],gaps:[{description,jobEvidenceRefs,profileEvidenceRefs}]}.',
      "Keep explanations brief and evidence-specific. Return only valid JSON.",
    ].join("\n"),
    userPrompt: json({
      title,
      jobUnderstanding: compactUnderstanding,
      jobEvidence,
      confirmedProfileEvidence: profileEvidence,
      candidateFacts: {
        knownEmploymentMonths: facts.knownEmploymentMonths,
        employmentEvidenceRefs: facts.employmentEvidenceRefs,
        unknownEmploymentPeriodRefs: facts.unknownEmploymentPeriodRefs,
      },
    }),
  });

  const assessmentInput = parse(response.content, matchAssessmentInputSchema);
  const assessment = validateAndClassifyAssessment(
    assessmentInput,
    understanding,
    new Set(jobEvidence.map((item) => item.id)),
    new Set(profileEvidence.map((item) => item.id)),
  );
  return { assessment, provider: response.provider, model: response.model };
}
