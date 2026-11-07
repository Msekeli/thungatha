import { z } from "zod";

const nullableDate = z.string().datetime({ offset: true }).nullable();
const nullableUrl = z.string().nullable();

export const scoutExportVacancySchema = z
  .object({
    scout_vacancy_id: z.string().uuid(),
    employer_name: z.string(),
    logo_url: nullableUrl,
    title: z.string(),
    description: z.string(),
    location_text: z.string().nullable(),
    application_url: z.string().min(1),
    published_at: nullableDate,
    source_updated_at: nullableDate,
    first_seen_at: z.string().datetime({ offset: true }),
  })
  .strict();

export const scoutExportPageSchema = z
  .object({
    items: z.array(scoutExportVacancySchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().nonnegative(),
    has_more: z.boolean(),
    location_scope: z.enum([
      "cape_town",
      "western_cape",
      "south_africa",
      "all",
    ]),
  })
  .strict();

export type ScoutExportVacancy = z.infer<typeof scoutExportVacancySchema>;
