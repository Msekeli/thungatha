import { z } from "zod";

const optionalHttpUrl = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Must be an HTTP or HTTPS URL.")
  .nullable();

const optionalDate = z.string().datetime({ offset: true }).nullable();

function hasMeaningfulDescription(value: string) {
  const visibleText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi, " ")
    .replace(/&(?:amp|lt|gt|quot|apos);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return visibleText.length >= 20;
}

/**
 * Exact Scout-to-Thungatha vacancy contract.
 * Scout sanitises description HTML before sending it; Thungatha stores the
 * original sanitised string without trimming or rewriting its markup.
 */
export const scoutVacancySchema = z
  .object({
    scoutVacancyId: z.string().uuid(),
    jobTitle: z.string().trim().min(2).max(300),
    companyName: z.string().trim().min(2).max(300),
    companyLogoUrl: optionalHttpUrl,
    location: z.string().trim().min(2).max(500),
    description: z.string().min(1).refine(
      hasMeaningfulDescription,
      "Description must contain meaningful job information.",
    ),
    applicationUrl: z
      .string()
      .url()
      .refine((value) => {
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:";
      }, "Application URL must use HTTP or HTTPS."),
    publishedAt: optionalDate,
    updatedAt: optionalDate,
  })
  .strict();

export const scoutVacancyBatchSchema = z
  .array(scoutVacancySchema)
  .min(1)
  .max(100)
  .superRefine((vacancies, context) => {
    const ids = new Set<string>();
    vacancies.forEach((vacancy, index) => {
      if (ids.has(vacancy.scoutVacancyId)) {
        context.addIssue({
          code: "custom",
          path: [index, "scoutVacancyId"],
          message: "A Scout vacancy ID may appear only once per batch.",
        });
      }
      ids.add(vacancy.scoutVacancyId);
    });
  });

export type ScoutVacancy = z.infer<typeof scoutVacancySchema>;
