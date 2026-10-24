import { z } from "zod";

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(1).max(150).nullable().optional(), email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(), location: z.string().trim().max(150).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(), residentialSuburb: z.string().trim().max(150).nullable().optional(),
  residentialCity: z.string().trim().max(150).nullable().optional(), residentialProvince: z.string().trim().max(150).nullable().optional(),
  residentialPostalCode: z.string().trim().max(20).nullable().optional(), linkedinUrl: z.string().trim().max(255).nullable().optional(),
  portfolioUrl: z.string().trim().max(255).nullable().optional(),
}).strict();

export const workExperienceItemSchema = z.object({
  id: z.string().trim().min(1).max(100), jobTitle: z.string().trim().min(1).max(150), employer: z.string().trim().min(1).max(150),
  location: z.string().trim().max(150).nullable().optional(), startDate: z.string().trim().min(1).max(50), endDate: z.string().trim().max(50).nullable().optional(),
  isCurrent: z.boolean().default(false), description: z.string().trim().max(5000).nullable().optional(), achievements: z.array(z.string().trim().min(1).max(1000)).max(50).optional(),
}).strict();

export const educationItemSchema = z.object({
  id: z.string().trim().min(1).max(100), educationLevel: z.string().trim().max(100).nullable().optional(),
  qualification: z.string().trim().min(1).max(150), institution: z.string().trim().min(1).max(150), fieldOfStudy: z.string().trim().max(150).nullable().optional(),
  startDate: z.string().trim().max(50).nullable().optional(), endDate: z.string().trim().max(50).nullable().optional(), isCurrent: z.boolean().optional().default(false),
}).strict();

export const certificationItemSchema = z.object({
  id: z.string().trim().min(1).max(150), type: z.enum(["professional-certification", "occupational-certificate", "professional-licence", "drivers-licence", "other"]).optional(),
  name: z.string().trim().min(1).max(150), issuer: z.string().trim().max(150).nullable().optional(), issueDate: z.string().trim().max(50).nullable().optional(),
  expiryDate: z.string().trim().max(50).nullable().optional(), issuingCountry: z.string().trim().max(100).nullable().optional(),
  licenceCategories: z.array(z.string().trim().max(30)).max(20).optional(), licenceNumber: z.string().trim().max(100).nullable().optional(),
  endorsements: z.string().trim().max(500).nullable().optional(),
}).strict().superRefine((entry, context) => {
  if (!entry.type) return;
  if (entry.type === "drivers-licence" && !entry.issuingCountry?.trim()) {
    context.addIssue({ code: "custom", path: ["issuingCountry"], message: "Issuing country is required." });
  }
  if (entry.type !== "drivers-licence" && !entry.issuer?.trim()) {
    context.addIssue({ code: "custom", path: ["issuer"], message: "Issuing organisation is required." });
  }
});

export const projectItemSchema = z.object({
  id: z.string().trim().min(1).max(100), name: z.string().trim().min(1).max(150), description: z.string().trim().max(5000).nullable().optional(),
  role: z.string().trim().max(150).nullable().optional(), url: z.string().trim().max(255).nullable().optional(),
}).strict();
export const languageItemSchema = z.string().trim().min(1).max(100);
export const personalAttributeItemSchema = z.string().trim().min(1).max(150);
export const masterCvMetadataSchema = z.object({
  filename: z.string().trim().min(1).max(255), fileSize: z.number().int().nonnegative(), uploadedAt: z.string().trim().min(1).max(100),
  storagePath: z.string().trim().max(500).nullable().optional(),
}).strict();
