import { z } from "zod";

const refs = z.array(z.string().min(1));
const requiredRefs = refs.min(1);
// Semantic alignment cites evidence across the whole assessment, so its
// aggregate reference lists can legitimately exceed the per-item limit.
const aggregateRefs = z.array(z.string().min(1));
const requiredAggregateRefs = aggregateRefs.min(1);

export const jobUnderstandingSchema = z.object({
  summary: z.string().min(1),
  responsibilities: z.array(z.object({
    id: z.string().min(1),
    statement: z.string().min(1),
    sourceEvidenceRefs: requiredRefs,
  })),
  capabilities: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    context: z.string(),
    sourceEvidenceRefs: requiredRefs,
  })),
  requirements: z.array(z.object({
    id: z.string().min(1),
    statement: z.string().min(1),
    category: z.enum(["experience", "skill", "technology", "qualification", "certification", "licence", "language", "location", "work_mode", "other"]),
    importance: z.enum(["mandatory", "preferred", "uncertain"]),
    sourceEvidenceRefs: requiredRefs,
  })),
  coverage: z.enum(["complete", "partial", "unavailable"]),
});

const requirementAssessment = z.object({
  id: z.string().min(1),
  requirement: z.string().min(1),
  importance: z.enum(["mandatory", "preferred", "uncertain"]),
  assessment: z.enum(["supported", "not_demonstrated", "contradictory", "uncertain"]),
  explanation: z.string().min(1),
  jobEvidenceRefs: requiredRefs,
  profileEvidenceRefs: refs,
}).superRefine((item, context) => {
  if (item.assessment === "supported" && item.profileEvidenceRefs.length === 0) {
    context.addIssue({ code: "custom", message: "Supported requirements need confirmed Profile evidence." });
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
  if (assessment.semanticAlignment.level !== "insufficient" && assessment.semanticAlignment.profileEvidenceRefs.length === 0) {
    context.addIssue({ code: "custom", message: "Meaningful alignment needs confirmed Profile evidence." });
  }
});

export type JobUnderstanding = z.infer<typeof jobUnderstandingSchema>;
export type MatchAssessmentInput = z.infer<typeof matchAssessmentInputSchema>;
