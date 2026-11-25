import { z } from "zod";

const refs = z.array(z.string().min(1));
const requiredRefs = refs.min(1);
const aggregateRefs = z.array(z.string().min(1));
const requiredAggregateRefs = aggregateRefs.min(1);

const requirementAssessment = z.object({
  id: z.string().min(1),
  requirement: z.string().min(1),
  importance: z.enum(["mandatory", "preferred", "uncertain"]),
  assessment: z.enum([
    "supported", "not_demonstrated", "contradictory", "uncertain",
  ]),
  explanation: z.string().min(1),
  jobEvidenceRefs: requiredRefs,
  profileEvidenceRefs: refs,
}).superRefine((item, context) => {
  if (item.assessment === "supported" && item.profileEvidenceRefs.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Supported requirements need confirmed Profile evidence.",
    });
  }
});

export const matchAssessmentInputSchema = z.object({
  semanticAlignment: z.object({
    level: z.enum(["strong", "meaningful", "insufficient"]),
    materialGaps: z.boolean(),
    jobEvidenceRefs: requiredAggregateRefs,
    profileEvidenceRefs: aggregateRefs,
  }),
  summary: z.string().min(1),
  alignmentExplanation: z.string().min(1),
  requirements: z.array(requirementAssessment),
  gaps: z.array(z.object({
    description: z.string().min(1),
    jobEvidenceRefs: requiredRefs,
    profileEvidenceRefs: refs,
  })),
}).superRefine((assessment, context) => {
  if (
    assessment.semanticAlignment.level !== "insufficient" &&
    assessment.semanticAlignment.profileEvidenceRefs.length === 0
  ) {
    context.addIssue({
      code: "custom",
      message: "Meaningful alignment needs confirmed Profile evidence.",
    });
  }
});

export type MatchAssessmentInput = z.infer<typeof matchAssessmentInputSchema>;
