import { createCvSectionTailoringResponseSchema } from "@/thungatha-features/cv-studio/server/cv-tailoring-schema";

export const profileRef = "cv:workExperience[experience-1].description";
export const jobRef = "job:segment:4";
export const targetPath = "workExperience[experience-1].description";
export const requirementId = "requirement-1";

export const createContract = () =>
  createCvSectionTailoringResponseSchema(
    [profileRef],
    [jobRef],
    [targetPath],
    [requirementId],
  );
