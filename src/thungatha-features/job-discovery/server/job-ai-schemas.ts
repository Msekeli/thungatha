import { z } from "zod";

const evidenceRefs = z.array(z.string().min(1)).min(1);
export const jobUnderstandingSchema = z.object({
  summary: z.string().min(1).max(3000),
  responsibilities: z.array(z.object({
    id: z.string().min(1), statement: z.string().min(1),
    sourceEvidenceRefs: evidenceRefs,
  })).max(40),
  capabilities: z.array(z.object({
    id: z.string().min(1), name: z.string().min(1),
    context: z.string().max(1000), sourceEvidenceRefs: evidenceRefs,
  })).max(60),
  requirements: z.array(z.object({
    id: z.string().min(1), statement: z.string().min(1),
    category: z.enum(["experience", "skill", "technology", "qualification", "certification", "licence", "language", "location", "work_mode", "other"]),
    importance: z.enum(["mandatory", "preferred", "uncertain"]),
    sourceEvidenceRefs: evidenceRefs,
  })).max(80),
  coverage: z.enum(["complete", "partial", "unavailable"]),
});

export const matchAssessmentSchema = z.object({
  classification: z.enum(["match", "relevant", "unclassified"]),
  summary: z.string().min(1).max(2000),
  alignmentExplanation: z.string().min(1).max(3000),
  requirements: z.array(z.object({
    id: z.string().min(1), requirement: z.string().min(1),
    assessment: z.enum(["supported", "not_demonstrated", "contradictory", "uncertain"]),
    explanation: z.string().min(1).max(1500),
    jobEvidenceRefs: z.array(z.string()),
    profileEvidenceRefs: z.array(z.string()),
  })).max(100),
  gaps: z.array(z.object({
    description: z.string().min(1).max(1000),
    jobEvidenceRefs: z.array(z.string()),
    profileEvidenceRefs: z.array(z.string()),
  })).max(40),
});

export type JobUnderstanding = z.infer<typeof jobUnderstandingSchema>;
export type MatchAssessment = z.infer<typeof matchAssessmentSchema>;
