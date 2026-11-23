import "server-only";
import { ZodError } from "zod";
import { completeAiTask } from "@/lib/ai/provider-router";
import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import type { JobMatchingContext } from "./job-ai-queue-eligibility";
import {
  assertEvidenceReferences,
  buildJobEvidence,
  buildProfileEvidence,
} from "./job-ai-evidence";
import {
  jobUnderstandingSchema,
  matchAssessmentInputSchema,
  jobUnderstandingResponseSchema,
  matchAssessmentResponseSchema,
  type JobUnderstanding,
} from "./job-ai-schemas";
import { AssessmentUnavailableError, validateAndClassifyAssessment } from "./job-ai-classification";

const json = (value: unknown) => JSON.stringify(value);

function describeJsonShape(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return `root=${Array.isArray(value) ? "array" : typeof value}`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).slice(0, 20);
  const arrays = ["responsibilities", "capabilities", "requirements"]
    .filter((key) => Array.isArray(record[key]))
    .map((key) => {
      const items = record[key] as unknown[];
      const first = items[0];
      const itemKeys = first && typeof first === "object" && !Array.isArray(first)
        ? Object.keys(first as Record<string, unknown>).slice(0, 12)
        : [];
      return `${key}=${items.length} items; firstItemKeys=[${itemKeys.join(",")}]`;
    });
  return `topLevelKeys=[${keys.join(",")}]; ${arrays.join("; ")}`;
}

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
      throw new Error(`${stage}: AI output failed schema validation: ${issues.join("; ")}. Returned shape: ${describeJsonShape(value)}`);
    }
    throw new Error(`${stage}: AI output could not be validated.`);
  }
}

async function parseAssessmentWithJsonRepair(content: string) {
  try {
    return parse("Candidate assessment", content, matchAssessmentInputSchema);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("AI returned invalid JSON")) throw error;

    // Gemini occasionally emits malformed JSON despite application/json mode.
    // Ask the same provider to repair syntax only; the normal Zod, evidence,
    // exact-requirement, and classification checks still run afterwards.
    const repair = await completeAiTask({
      task: "job-fit-assessment",
      responseFormat: "json",
      responseSchema: matchAssessmentResponseSchema,
      temperature: 0,
      timeoutMs: 120_000,
      reasoning: false,
      systemPrompt: [
        "Repair the supplied candidate assessment into syntactically valid JSON.",
        "This is a syntax-only repair. Preserve every value, identifier, requirement wording, assessment, explanation, and evidence reference exactly.",
        "Do not add, remove, infer, summarize, or change any information. Do not invent evidence references.",
        "Return one JSON object only, with top-level fields semanticAlignment, summary, alignmentExplanation, requirements, and gaps.",
        "If a value is malformed or incomplete, preserve the available content and use only the minimum syntax correction needed.",
      ].join("\\n"),
      userPrompt: content,
    });
    assertCompleteResponse("Candidate assessment JSON repair", repair);
    return parse("Candidate assessment", repair.content, matchAssessmentInputSchema);
  }
}

function assertCompleteResponse(stage: string, response: { provider: string; finishReason?: string }) {
  const finishReason = response.finishReason?.toUpperCase();
  if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
    throw new Error(`${stage}: ${response.provider} stopped at the output-token limit; the JSON response may be incomplete.`);
  }
}

export function parseJobUnderstanding(context: JobMatchingContext, value: unknown): JobUnderstanding {
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
  const allowed = new Set(buildJobEvidence(context.description).map((item) => item.id));
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

export async function understandJobWithAi(context: JobMatchingContext) {
  const evidence = buildJobEvidence(context.description);
  if (evidence.length === 0) {
    throw new Error("The job description does not contain enough readable text.");
  }

  const response = await completeAiTask({
    task: "job-requirement-extraction",
    responseFormat: "json",
    responseSchema: jobUnderstandingResponseSchema,
    temperature: 0.1,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Understand the complete job advert in context, not just its title or familiar keywords.",
      "Identify only material responsibilities, capabilities, and requirements that affect the actual work or candidate suitability.",
      "Preserve semantic meaning, equivalent terminology, transferable work context, and explicit versus uncertain wording.",
      "Combine duplicate or closely related items. Do not produce exhaustive paraphrases, generic soft skills, benefits, or boilerplate.",
      "Include every material responsibility, capability, and requirement supported by the advert. Do not impose arbitrary item-count limits or silently omit material information.",
      "Every item must cite the exact supplied job evidence IDs that support it. Do not invent evidence references or omit material supporting evidence.",
      "Classify requirement importance as mandatory, preferred, or uncertain using the context of the full advert, not isolated keyword triggers.",
      "Keep each statement concise. Return a short role-purpose summary.",
      "Return one JSON object at the root. Do not wrap it in a result, data, job, analysis, or response property. Do not return an array or prose.",
      "Required root object fields: summary (string), responsibilities (array of objects with id, statement, sourceEvidenceRefs), capabilities (array of objects with id, name, context, sourceEvidenceRefs), requirements (array of objects with id, statement, category, importance, sourceEvidenceRefs), and coverage (complete, partial, or unavailable).",
      "Every object and every listed property is required, including when an array is empty. Use empty arrays when no items exist. Do not replace arrays of objects with strings.",
      "Use only the allowed category and importance values stated below. IDs must be short unique strings within this response. Evidence references must be exact IDs from sourceEvidence.",
      "Requirement categories: experience, skill, technology, qualification, certification, licence, language, location, work_mode, other.",
      "Return only valid JSON. No scores, percentages, role-family labels, or hiring predictions.",
    ].join("\n"),
    userPrompt: json({ jobContext: context, sourceEvidence: evidence }),
  });

  assertCompleteResponse("Job understanding", response);
  const result = parseJobUnderstanding(context, response.content);
  return { analysis: result, provider: response.provider, model: response.model };
}

export async function assessJobWithAi(
  context: JobMatchingContext,
  understanding: JobUnderstanding,
  facts: CandidateFacts,
) {
  const allJobEvidence = buildJobEvidence(context.description);
  const referencedJobIds = new Set([
    ...understanding.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const referencedJobEvidence = allJobEvidence.filter((item) => referencedJobIds.has(item.id));
  const jobEvidence = referencedJobEvidence.length
    ? referencedJobEvidence
    : allJobEvidence;
  const profileEvidence = buildProfileEvidence(facts);

  if (!jobEvidence.length) {
    throw new Error("The job advert does not contain usable source evidence.");
  }
  if (!profileEvidence.length) {
    throw new AssessmentUnavailableError("The confirmed Profile does not contain enough evidence to assess this role.");
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
    responseSchema: matchAssessmentResponseSchema,
    temperature: 0.1,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Compare the actual work and material requirements with the candidate's confirmed Profile evidence.",
      "Recognise equivalent responsibilities across different titles and transferable capabilities across contexts when the evidence supports the relationship. Titles are context, never gates.",
      "Treat target-role preference as soft context only, never as proof of a skill or experience.",
      "Missing Profile information means not demonstrated, not proof that the candidate lacks the capability.",
      "Use only supplied jobEvidence and confirmedProfileEvidence IDs. Cite exact IDs for every factual claim.",
      "Assess every extracted requirement exactly once, preserving its exact id, exact wording, and importance. Do not add, omit, duplicate, or reclassify requirements.",
      "Keep explanations clear and concise while preserving the evidence and reasoning needed to understand the assessment.",
      "A supported requirement must cite confirmed Profile evidence. Every requirement must cite job evidence.",
      "If no material requirements or responsibilities were extracted, return insufficient alignment and do not infer candidate fit.",
      "Explain material gaps and uncertainty concisely. Do not calculate scores, percentages, weights, rankings, or hiring predictions.",
      "Return semanticAlignment as strong, meaningful, or insufficient and state whether material gaps remain. Application code derives Match or Relevant; insufficient evidence produces an unavailable assessment, not a third classification.",
      "Return one JSON object with exactly these top-level fields: semanticAlignment, summary, alignmentExplanation, requirements, gaps.",
      "semanticAlignment must contain level (strong, meaningful, insufficient), materialGaps (boolean), jobEvidenceRefs (array), and profileEvidenceRefs (array).",
      "Each requirements item must contain id, requirement, importance (mandatory, preferred, uncertain), assessment (supported, not_demonstrated, contradictory, uncertain), explanation, jobEvidenceRefs, and profileEvidenceRefs.",
      "Each gaps item must contain description, jobEvidenceRefs, and profileEvidenceRefs.",
      "Use no additional fields. Every requirement must exactly preserve the extracted id, wording, and importance. Return only JSON, without markdown.",
    ].join("\n"),
    userPrompt: json({
      jobContext: context,
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
  const assessmentInput = await parseAssessmentWithJsonRepair(response.content);
  const assessment = validateAndClassifyAssessment(
    assessmentInput,
    understanding,
    new Set(jobEvidence.map((item) => item.id)),
    new Set(profileEvidence.map((item) => item.id)),
  );
  return { assessment, provider: response.provider, model: response.model };
}
