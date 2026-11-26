import { ZodError } from "zod";
import type { JobMatchingContext } from "./job-ai-queue-eligibility";
import { assertEvidenceReferences, buildJobEvidence } from "./job-ai-evidence";
import { jobUnderstandingSchema, type JobUnderstanding } from "./job-ai-schemas";
import { parseAiResponse } from "./job-ai-response-validation";

export function parseJobUnderstanding(
  context: JobMatchingContext,
  value: unknown,
): JobUnderstanding {
  const result = typeof value === "string"
    ? parseAiResponse("Job understanding", value, jobUnderstandingSchema)
    : (() => {
        try {
          return jobUnderstandingSchema.parse(value);
        } catch (cause) {
          if (cause instanceof ZodError) {
            const issues = cause.issues.slice(0, 12).map((issue) => {
              const path = issue.path.length ? issue.path.join(".") : "(root)";
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
