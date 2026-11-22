import "server-only";
import { ZodError } from "zod";
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
  stage: string,
  content: string,
  schema: { parse: (value: unknown) => T },
): T {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "unknown JSON parsing error";
    throw new Error(`${stage}: AI returned invalid JSON (${detail}).`);
  }

  try {
    return schema.parse(value);
  } catch (cause) {
    if (cause instanceof ZodError) {
      const issues = cause.issues.slice(0, 12).map((issue) => {
        const path = issue.path.length ? issue.path.join(".") : "(root)";
        return `${path}: ${issue.message}`;
      });
      throw new Error(`${stage}: AI output failed schema validation: ${issues.join("; ")}`);
    }
    throw new Error(`${stage}: AI output could not be validated.`);
  }
}

function assertCompleteResponse(stage: string, response: { provider: string; finishReason?: string }) {
  const finishReason = response.finishReason?.toUpperCase();
  if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
    throw new Error(`${stage}: ${response.provider} stopped at the output-token limit; the JSON response may be incomplete.`);
  }
}

export function parseJobUnderstanding(description: string, value: unknown): JobUnderstanding {
  const result = typeof value === "string"
    ? parse("Job understanding", value, jobUnderstandingSchema)
    : (() => {
        try {
          return jobUnderstandingSchema.parse(value);
        } catch (cause) {
          if (cause instanceof ZodError) {
            const issues = cause.issues.slice(0, 12).map((issue) => {
              const path = issue.path.length ? issue.path.join(".") : "(root)";
              return `${path}: ${issue.message}`;
            });
            throw new Error(`Cached job understanding failed schema validation: ${issues.join("; ")}`);
          }
          throw new Error("Cached job understanding could not be validated.");
        }
      })();
  const allowed = new Set(buildJobEvidence(description).map((item) => item.id));
  const refs = [
    ...result.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ];
  if (!assertEvidenceReferences(refs, allowed)) {
    throw new Error("Job understanding referenced evidence outside the current job description.");
  }
  return result;
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
    maxOutputTokens: 3600,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Understand the complete job advert in context, not just its title or familiar keywords.",
      "Identify only material responsibilities, capabilities, and requirements that affect the actual work or candidate suitability.",
      "Preserve semantic meaning, equivalent terminology, transferable work context, and explicit versus uncertain wording.",
      "Combine duplicate or closely related items. Do not produce exhaustive paraphrases, generic soft skills, benefits, or boilerplate.",
      "Return at most 12 responsibilities, 16 capabilities, and 24 material requirements. If the advert contains more material information than fits, mark coverage partial rather than silently implying completeness.",
      "Every item must cite between one and four exact supplied job evidence IDs. Use only the smallest set of IDs that directly supports the item; never list every related fragment and never invent an ID.",
      "Classify requirement importance as mandatory, preferred, or uncertain using the context of the full advert, not isolated keyword triggers.",
      "Keep each statement concise. Return a short role-purpose summary.",
      "Return JSON conforming exactly to the supplied response schema.",
      "Requirement categories: experience, skill, technology, qualification, certification, licence, language, location, work_mode, other.",
      "Return only valid JSON. No scores, percentages, role-family labels, or hiring predictions.",
    ].join("\n"),
    userPrompt: json({ sourceEvidence: evidence }),
  });

  assertCompleteResponse("Job understanding", response);
  const result = parseJobUnderstanding(description, response.content);
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
    // A complete evidence-linked assessment can be substantially larger than
    // the extraction response. Keep enough headroom for all 24 requirements.
    maxOutputTokens: 6000,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Compare the actual work and material requirements with the candidate's confirmed Profile evidence.",
      "Recognise equivalent responsibilities across different titles and transferable capabilities across contexts when the evidence supports the relationship. Titles are context, never gates.",
      "Treat target-role preference as soft context only, never as proof of a skill or experience.",
      "Missing Profile information means not demonstrated, not proof that the candidate lacks the capability.",
      "Use only supplied jobEvidence and confirmedProfileEvidence IDs. Cite exact IDs for every factual claim.",
      "Assess every extracted requirement exactly once, preserving its exact id, exact wording, and importance. Do not add, omit, duplicate, or reclassify requirements.",
      "For each requirement, keep explanation to one concise sentence of at most 160 characters. Do not repeat the requirement in the explanation.",
      "A supported requirement must cite confirmed Profile evidence. Every requirement must cite job evidence.",
      "If no material requirements or responsibilities were extracted, return insufficient alignment and do not infer candidate fit.",
      "Explain material gaps and uncertainty concisely. Do not calculate scores, percentages, weights, rankings, or hiring predictions.",
      "Return semanticAlignment as strong, meaningful, or insufficient and state whether material gaps remain. Application code derives Match, Relevant, or Unclassified.",
      "Return one JSON object with exactly these top-level fields: semanticAlignment, summary, alignmentExplanation, requirements, gaps.",
      "semanticAlignment must contain level (strong, meaningful, insufficient), materialGaps (boolean), jobEvidenceRefs (array), and profileEvidenceRefs (array).",
      "Each requirements item must contain id, requirement, importance (mandatory, preferred, uncertain), assessment (supported, not_demonstrated, contradictory, uncertain), explanation, jobEvidenceRefs, and profileEvidenceRefs.",
      "Each gaps item must contain description, jobEvidenceRefs, and profileEvidenceRefs.",
      "Use no additional fields. Every requirement must exactly preserve the extracted id, wording, and importance. Return only JSON, without markdown.",
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

  assertCompleteResponse("Candidate assessment", response);
  const assessmentInput = parse("Candidate assessment", response.content, matchAssessmentInputSchema);
  const assessment = validateAndClassifyAssessment(
    assessmentInput,
    understanding,
    new Set(jobEvidence.map((item) => item.id)),
    new Set(profileEvidence.map((item) => item.id)),
  );
  return { assessment, provider: response.provider, model: response.model };
}
