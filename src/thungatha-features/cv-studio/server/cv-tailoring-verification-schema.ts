import { z } from "zod";

export const cvTailoringReviewSchema = z.object({
  reviews: z.array(z.object({
    index: z.number().int().nonnegative(),
    decision: z.enum(["approve", "reject"]),
    issue: z.string(),
  }).strict()),
}).strict();

export type CvTailoringReview = z.infer<typeof cvTailoringReviewSchema>;
