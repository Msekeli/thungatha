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
  createJobUnderstandingResponseSchema,
  createMatchAssessmentResponseSchema,
  type JobUnderstanding,
  type MatchAssessmentModelOutput,
} from "./job-ai-schemas";
import {
  AssessmentUnavailableError,
  validateAndClassifyAssessment,
} from "./job-ai-classification";

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
      const itemKeys =
        first && typeof first === "object" && !Array.isArray(first)
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
    const detail =
      cause instanceof Error ? cause.message : "unknown JSON parsing error";
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
      throw new Error(
        `${stage}: AI output failed schema validation: ${issues.join("; ")}. Returned shape: ${describeJsonShape(value)}`,
      );
    }
    throw new Error(`${stage}: AI output could not be validated.`);
  }
}

export function attachCanonicalRequirements(
  modelOutput: MatchAssessmentModelOutput,
  understanding: JobUnderstanding,
) {
  const extracted = new Map(
    understanding.requirements.map((item) => [item.id, item]),
  );
  if (extracted.size !== understanding.requirements.length) {
    throw new Error(
      "Extracted job requirements contain duplicate identifiers.",
    );
  }

  const seen = new Set<string>();
  for (const item of modelOutput.requirements) {
    if (!extracted.has(item.id)) {
      throw new Error(
        `AI assessment returned unknown requirement ID "${item.id}".`,
      );
    }
    if (seen.has(item.id)) {
      throw new Error(
        `AI assessment returned duplicate requirement ID "${item.id}".`,
      );
    }
    seen.add(item.id);
  }
  const missing = [...extracted.keys()].filter((id) => !seen.has(id));
  if (missing.length) {
    throw new Error(
      `AI assessment omitted extracted requirement IDs: ${missing.join(", ")}.`,
    );
  }

  return matchAssessmentInputSchema.parse({
    ...modelOutput,
    requirements: modelOutput.requirements.map((item) => {
      const source = extracted.get(item.id)!;
      return {
        ...item,
        requirement: source.statement,
        importance: source.importance,
      };
    }),
  });
}

async function parseAssessmentWithJsonRepair(
  content: string,
  modelSchema: ReturnType<typeof createMatchAssessmentResponseSchema>,
) {
  try {
    return parse("Candidate assessment", content, modelSchema.validator);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("AI returned invalid JSON")
    )
      throw error;

    const repair = await completeAiTask({
      task: "job-fit-assessment",
      responseFormat: "json",
      responseSchema: modelSchema.responseSchema,
      temperature: 0,
      maxOutputTokens: 2_048,
      timeoutMs: 120_000,
      reasoning: false,
      systemPrompt: [
        "Repair the supplied candidate assessment into syntactically valid JSON.",
        "This is a syntax-only repair. Preserve every identifier, assessment, explanation, and evidence reference exactly.",
        "Do not add, remove, infer, summarize, or change any information. Do not invent evidence references.",
        "Return one JSON object only, with top-level fields semanticAlignment, summary, alignmentExplanation, requirements, and gaps.",
        "Each requirement item contains only id, assessment, explanation, jobEvidenceRefs, and profileEvidenceRefs.",
        "If a value is malformed or incomplete, preserve the available content and use only the minimum syntax correction needed.",
      ].join("\\n"),
      userPrompt: content,
    });
    assertCompleteResponse("Candidate assessment JSON repair", repair);
    return parse("Candidate assessment", repair.content, modelSchema.validator);
  }
}

function assertCompleteResponse(
  stage: string,
  response: { provider: string; finishReason?: string },
) {
  const finishReason = response.finishReason?.toUpperCase();
  if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
    throw new Error(
      `${stage}: ${response.provider} stopped at the output-token limit; the JSON response may be incomplete.`,
    );
  }
}

export function parseJobUnderstanding(
  context: JobMatchingContext,
  value: unknown,
): JobUnderstanding {
  const result =
    typeof value === "string"
      ? parse("Job understanding", value, jobUnderstandingSchema)
      : (() => {
          try {
            return jobUnderstandingSchema.parse(value);
          } catch (cause) {
            if (cause instanceof ZodError) {
              const issues = cause.issues.slice(0, 12).map((issue) => {
                const path = issue.path.length
                  ? issue.path.join(".")
                  : "(root)";
                return `${path}: ${issue.message}`;
              });
              throw new Error(
                `Cached job understanding failed schema validation: ${issues.join("; ")}`,
              );
            }
            throw new Error("Cached job understanding could not be validated.");
          }
        })();
  const allowed = new Set(
    buildJobEvidence(context.description, context).map((item) => item.id),
  );
  const refs = [
    ...result.responsibilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...result.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ];
  if (!assertEvidenceReferences(refs, allowed)) {
    throw new Error(
      "Job understanding referenced evidence outside the current job description.",
    );
  }
  return result;
}

export async function understandJobWithAi(context: JobMatchingContext) {
  const evidence = buildJobEvidence(context.description, context);
  if (evidence.length === 0) {
    throw new Error(
      "The job description does not contain enough readable text.",
    );
  }

  const response = await completeAiTask({
    task: "job-requirement-extraction",
    responseFormat: "json",
    responseSchema: createJobUnderstandingResponseSchema(
      evidence.map((item) => item.id),
    ),
    temperature: 0.1,
    maxOutputTokens: 4_096,
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
  return {
    analysis: result,
    provider: response.provider,
    model: response.model,
  };
}

export async function assessJobWithAi(
  context: JobMatchingContext,
  understanding: JobUnderstanding,
  facts: CandidateFacts,
) {
  const allJobEvidence = buildJobEvidence(context.description, context);
  const referencedJobIds = new Set([
    ...understanding.responsibilities.flatMap(
      (item) => item.sourceEvidenceRefs,
    ),
    ...understanding.capabilities.flatMap((item) => item.sourceEvidenceRefs),
    ...understanding.requirements.flatMap((item) => item.sourceEvidenceRefs),
  ]);
  const referencedJobEvidence = allJobEvidence.filter((item) =>
    referencedJobIds.has(item.id),
  );
  const metadataEvidence = allJobEvidence.filter(
    (item) => item.sourcePath !== "description",
  );
  const jobEvidence = referencedJobEvidence.length
    ? [...metadataEvidence, ...referencedJobEvidence]
    : allJobEvidence;
  const profileEvidence = buildProfileEvidence(facts);

  if (!jobEvidence.length) {
    throw new Error("The job advert does not contain usable source evidence.");
  }
  if (!profileEvidence.length) {
    throw new AssessmentUnavailableError(
      "The confirmed Profile does not contain enough evidence to assess this role.",
    );
  }

  const modelSchema = createMatchAssessmentResponseSchema(
    jobEvidence.map((item) => item.id),
    profileEvidence.map((item) => item.id),
    understanding.requirements.map((item) => item.id),
  );

  // Encode evidence as [id, content] tuples. IDs and content remain lossless,
  // while repeated JSON property names and the duplicated full job description
  // are removed from the provider prompt.
  const compactUnderstanding = {
    coverage: understanding.coverage,
    responsibilities: understanding.responsibilities.map((item) => [
      item.id,
      item.statement,
      item.sourceEvidenceRefs,
    ]),
    capabilities: understanding.capabilities.map((item) => [
      item.id,
      item.name,
      item.context,
      item.sourceEvidenceRefs,
    ]),
    requirements: understanding.requirements.map((item) => [
      item.id,
      item.statement,
      item.category,
      item.importance,
      item.sourceEvidenceRefs,
    ]),
  };
  const compactJobEvidence = jobEvidence.map((item) => [item.id, item.content]);
  const compactProfileEvidence = profileEvidence.map((item) => [
    item.id,
    item.content,
  ]);
  // Reserve enough completion capacity for the full structured assessment.
  // Each requirement produces an explanation and two evidence-reference arrays;
  // GPT-OSS may also consume completion tokens for internal reasoning.
  const maxOutputTokens =
    2_048 +
    understanding.requirements.length * 384 +
    (jobEvidence.length + profileEvidence.length) * 32;
  const response = await completeAiTask({
    task: "job-fit-assessment",
    responseFormat: "json",
    responseSchema: modelSchema.responseSchema,
    temperature: 0.1,
    maxOutputTokens,
    timeoutMs: 120_000,
    reasoning: false,
    systemPrompt: [
      "Assess the actual work and material requirements against the candidate's confirmed Profile evidence.",
      "Recognise equivalent responsibilities and transferable capabilities when evidence supports the relationship. Titles are context, never gates.",
      "Target-role preference is soft context, not proof of skill or experience. Missing Profile information means not demonstrated, not proof of inability.",
      "Input format: jobUnderstanding has coverage plus responsibilities tuples [id, statement, jobEvidenceRefs], capabilities tuples [id, name, context, jobEvidenceRefs], and requirements tuples [id, statement, category, importance, jobEvidenceRefs]. jobEvidence and confirmedProfileEvidence are [exactEvidenceId, verbatimEvidenceContent] tuples.",
      "Use only supplied evidence IDs. Cite exact IDs for factual claims. Do not invent, alter, or infer evidence references.",
      "Assess every extracted requirement exactly once. Return its exact ID only; do not repeat requirement wording or importance. Application code attaches canonical wording and importance.",
      "A supported requirement must cite confirmed Profile evidence. Every requirement must cite job evidence. Explain material gaps and uncertainty clearly and concisely.",
      "If no material requirements or responsibilities were extracted, return insufficient alignment. Do not calculate scores, percentages, weights, rankings, or hiring predictions.",
      "Return semanticAlignment as strong, meaningful, or insufficient and state whether material gaps remain. Application code derives Match or Relevant; insufficient evidence produces unavailable, not a third classification.",
      "Return one JSON object with exactly these fields: semanticAlignment, summary, alignmentExplanation, requirements, gaps.",
      "semanticAlignment: level, materialGaps, jobEvidenceRefs, profileEvidenceRefs. Each requirement: id, assessment (supported, not_demonstrated, contradictory, uncertain), explanation, jobEvidenceRefs, profileEvidenceRefs. Each gap: description, jobEvidenceRefs, profileEvidenceRefs.",
      "Return every requirement exactly once. Use no additional fields. Return JSON only.",
    ].join("\\n"),
    userPrompt: json({
      jobUnderstanding: compactUnderstanding,
      jobEvidence: compactJobEvidence,
      confirmedProfileEvidence: compactProfileEvidence,
      employmentFacts: [
        facts.knownEmploymentMonths,
        facts.employmentEvidenceRefs,
        facts.unknownEmploymentPeriodRefs,
      ],
    }),
  });

  assertCompleteResponse("Candidate assessment", response);
  const modelOutput = await parseAssessmentWithJsonRepair(
    response.content,
    modelSchema,
  );
  const assessmentInput = attachCanonicalRequirements(
    modelOutput,
    understanding,
  );
  const assessment = validateAndClassifyAssessment(
    assessmentInput,
    understanding,
    new Set(jobEvidence.map((item) => item.id)),
    new Set(profileEvidence.map((item) => item.id)),
  );
  return { assessment, provider: response.provider, model: response.model };
}
