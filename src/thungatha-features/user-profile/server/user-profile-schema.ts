import { z } from "zod";
import {
  certificationItemSchema,
  educationItemSchema,
  languageItemSchema,
  masterCvMetadataSchema,
  personalAttributeItemSchema,
  personalDetailsSchema,
  projectItemSchema,
  workExperienceItemSchema,
} from "./user-profile-schema-primitives";

export * from "./user-profile-schema-primitives";
export const skillItemSchema = z.string().trim().min(1).max(50);

export const profileCompletionSchema = z.object({
  personalDetails: personalDetailsSchema.extend({
    fullName: z.string().trim().min(1).max(150),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(1).max(50),
    location: z.string().trim().min(1).max(150),
    country: z.string().trim().min(1).max(100),
    residentialSuburb: z.string().trim().min(1).max(150),
    residentialCity: z.string().trim().min(1).max(150),
    residentialProvince: z.string().trim().min(1).max(150),
  }),
  summary: z.string().trim().min(1).max(5000),
  education: z.array(educationItemSchema.extend({
    educationLevel: z.string().trim().min(1).max(100),
  })).min(1),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  nextRole: z.string().trim().max(150).nullable().optional(),
  personalDetails: personalDetailsSchema.optional(),
  summary: z.string().trim().max(5000).nullable().optional(),
  workExperience: z.array(workExperienceItemSchema).max(100).optional(),
  education: z.array(educationItemSchema).max(100).optional(),
  skills: z.array(skillItemSchema).max(100).optional(),
  certifications: z.array(certificationItemSchema).max(100).optional(),
  projects: z.array(projectItemSchema).max(100).optional(),
  languages: z.array(languageItemSchema).max(100).optional(),
  personalAttributes: z.array(personalAttributeItemSchema).max(100).optional(),
  masterCv: masterCvMetadataSchema.nullable().optional(),
  confirmedAt: z.string().trim().datetime({ offset: true }).nullable().optional(),
}).strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserProfileDto = {
  displayName: string | null;
  nextRole: string | null;
  personalDetails: z.infer<typeof personalDetailsSchema>;
  summary: string | null;
  workExperience: Array<z.infer<typeof workExperienceItemSchema>>;
  education: Array<z.infer<typeof educationItemSchema>>;
  skills: string[];
  certifications: Array<z.infer<typeof certificationItemSchema>>;
  projects: Array<z.infer<typeof projectItemSchema>>;
  languages: string[];
  personalAttributes: string[];
  masterCv: z.infer<typeof masterCvMetadataSchema> | null;
  confirmedAt: string | null;
  profileVersion: number;
  createdAt?: string;
  updatedAt?: string;
};
