import { matchAssessmentInputSchema } from "./job-ai-schemas";
import type {
  JobUnderstanding,
  MatchAssessmentModelOutput,
} from "./job-ai-schemas";

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
