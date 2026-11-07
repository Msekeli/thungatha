import { z } from "zod";

export const jobFeedQuerySchema = z.object({
  query: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  publishedWithin: z.enum(["any", "24h", "7d", "14d", "30d"]).default("any"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  state: z.enum(["all", "saved", "dismissed"]).default("all"),
  sortOrder: z.enum(["relevance", "newest", "oldest"]).default("newest"),
});

export type JobFeedQuery = z.infer<typeof jobFeedQuerySchema>;

export function sanitizeJobSearchTerm(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
