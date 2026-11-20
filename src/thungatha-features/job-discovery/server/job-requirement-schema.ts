import { z } from "zod";

export const requirementImportanceSchema = z.enum([
  "mandatory",
  "preferred",
  "uncertain",
]);

export const jobRequirementSchema = z.object({
  id: z.string().min(1),
  category: z.enum([
    "experience",
    "education",
    "certification",
    "licence",
    "language",
    "location",
    "work_mode",
    "skill",
  ]),
  value: z.string().min(1),
  importance: requirementImportanceSchema,
  sourceText: z.string().min(1),
  confidence: z.enum(["explicit", "contextual"]),
});

export const jobRequirementsSchema = z.object({
  schemaVersion: z.literal(1),
  extractionVersion: z.literal("m3-c02-v2"),
  descriptionHash: z.string().regex(/^[a-f0-9]{64}$/),
  roleFamily: z.enum([
    "software_it",
    "engineering",
    "finance_accounting",
    "administration",
    "healthcare",
    "sales_marketing",
    "human_resources",
    "operations_logistics",
    "education",
    "hospitality",
    "security",
  ]).nullable(),
  requirements: z.array(jobRequirementSchema),
  status: z.enum(["complete", "partial", "unavailable"]),
});

export type JobRequirement = z.infer<typeof jobRequirementSchema>;
export type JobRequirements = z.infer<typeof jobRequirementsSchema>;
