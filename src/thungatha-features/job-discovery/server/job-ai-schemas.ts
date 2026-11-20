import { z } from "zod";

const refs = z.array(z.string().min(1));
const requiredRefs = refs.min(1);

export const jobUnderstandingSchema = z.object({
  summary: z.string().min(1).max(3000),
  responsibilities: z.array(z.object({ id: z.string().min(1), statement: z.string().min(1), sourceEvidenceRefs: requiredRefs })).max(40),
  capabilities: z.array(z.object({ id: z.string().min(1), name: z.string().min(1), context: z.string().max(1000), sourceEvidenceRefs: requiredRefs })).max(60),
  requirements: z.array(z.object({
    id: z.string().min(1), statement: z.string().min(1),
    category: z.enum(["experience", "skill", "technology", "qualification", "certification", "licence", "language", "location", "work_mode", "other"]),
    importance: z.enum(["mandatory", "preferred", "uncertain"]), sourceEvidenceRefs: requiredRefs,
  })).max(80),
  coverage: z.enum(["complete", "partial", "unavailable"]),
});

const requirementAssessment = z.object({
  id: z.string().min(1), requirement: z.string().min(1),
  assessment: z.enum(["supported", "not_demonstrated", "contradictory", "uncertain"]),
  explanation: z.string().min(1).max(1500),
  jobEvidenceRefs: requiredRefs, profileEvidenceRefs: refs,
}).superRefine((item, context) => {
  if (item.assessment === "supported" && item.profileEvidenceRefs.length === 0) {
    context.addIssue({ code: "custom", message: "Supported requirements need confirmed Profile evidence." });
  }
});

export const matchAssessmentInputSchema = z.object({
  semanticAlignment: z.object({
    level: z.enum(["strong", "meaningful", "insufficient"]),
    materialGaps: z.boolean(),
    jobEvidenceRefs: requiredRefs,
    profileEvidenceRefs: refs,
  }),
  summary: z.string().min(1).max(2000),
  alignmentExplanation: z.string().min(1).max(3000),
  requirements: z.array(requirementAssessment).max(100),
  gaps: z.array(z.object({
    description: z.string().min(1).max(1000),
    jobEvidenceRefs: requiredRefs, profileEvidenceRefs: refs,
  })).max(40),
}).superRefine((assessment, context) => {
  if (assessment.semanticAlignment.level !== "insufficient" && assessment.semanticAlignment.profileEvidenceRefs.length === 0) {
    context.addIssue({ code: "custom", message: "Meaningful alignment needs confirmed Profile evidence." });
  }
});

export type JobUnderstanding = z.infer<typeof jobUnderstandingSchema>;
export type MatchAssessmentInput = z.infer<typeof matchAssessmentInputSchema>;
