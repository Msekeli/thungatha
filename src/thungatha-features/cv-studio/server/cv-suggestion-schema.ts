import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const cvSuggestionDecisionSchema = z.enum([
  "pending", "accepted", "rejected",
]);

export const cvSuggestionSchema = z.object({
  id: z.string().uuid(),
  targetPath: z.string().trim().min(1).max(300),
  originalText: text(5000).nullable(),
  proposedText: text(5000).min(1),
  reason: text(2000).min(1),
  evidenceRefs: z.array(z.string().trim().min(1).max(300)).min(1).max(50),
  evidence: z.array(z.object({
    ref: z.string().trim().min(1).max(300),
    source: z.enum(["profile", "job"]),
    excerpt: text(5000).min(1),
  }).strict()).min(2).max(100),
  decision: cvSuggestionDecisionSchema,
}).strict();

export type CvSuggestion = z.infer<typeof cvSuggestionSchema>;
