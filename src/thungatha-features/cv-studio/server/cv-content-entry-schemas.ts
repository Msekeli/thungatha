import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const cvWorkExperienceSchema = z
  .object({
    sourceId: z.string().min(1).max(100),
    jobTitle: text(150).min(1),
    employer: text(150).min(1),
    location: text(150).nullable(),
    startDate: text(50).min(1),
    endDate: text(50).nullable(),
    isCurrent: z.boolean(),
    description: text(5000).nullable(),
    achievements: z.array(text(1000).min(1)).max(50),
  })
  .strict();

export const cvEducationSchema = z
  .object({
    sourceId: z.string().min(1).max(100),
    educationLevel: text(100).nullable(),
    qualification: text(150).min(1),
    institution: text(150).min(1),
    fieldOfStudy: text(150).nullable(),
    startDate: text(50).nullable(),
    endDate: text(50).nullable(),
    isCurrent: z.boolean(),
  })
  .strict();

export const cvCertificationSchema = z
  .object({
    sourceId: z.string().min(1).max(150),
    type: z
      .enum([
        "professional-certification",
        "occupational-certificate",
        "professional-licence",
        "drivers-licence",
        "other",
      ])
      .nullable(),
    name: text(150).min(1),
    issuer: text(150).nullable(),
    issueDate: text(50).nullable(),
    expiryDate: text(50).nullable(),
    issuingCountry: text(100).nullable(),
    licenceCategories: z.array(text(30)).max(20),
    endorsements: text(500).nullable(),
  })
  .strict();

export const cvProjectSchema = z
  .object({
    sourceId: z.string().min(1).max(100),
    name: text(150).min(1),
    role: text(150).nullable(),
    description: text(5000).nullable(),
    url: text(255).nullable(),
  })
  .strict();
