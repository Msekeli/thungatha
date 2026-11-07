import { z } from "zod";

const nullableDate = z.string().datetime({ offset: true }).nullable();
const nullableHttpUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}).nullable();

export const scoutExportVacancySchema = z.object({
  scout_vacancy_id: z.string().uuid(),
  employer_name: z.string().trim().min(2).max(300),
  logo_url: nullableHttpUrl,
  title: z.string().trim().min(2).max(300),
  description: z.string().min(1),
  location_text: z.string().trim().min(2).max(500).nullable(),
  application_url: z.string().url().refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }),
  published_at: nullableDate,
  source_updated_at: nullableDate,
  first_seen_at: z.string().datetime({ offset: true }),
}).strict();

export const scoutExportPageSchema = z.object({
  items: z.array(scoutExportVacancySchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().nonnegative(),
  has_more: z.boolean(),
  location_scope: z.enum(["cape_town", "western_cape", "south_africa", "all"]),
}).strict();

export type ScoutExportVacancy = z.infer<typeof scoutExportVacancySchema>;
