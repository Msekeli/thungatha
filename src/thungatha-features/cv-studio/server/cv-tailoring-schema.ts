export const CV_TAILORING_VERSION = "m4-cv-tailoring-v9";

export { createCvTailoringResponseSchema } from "./cv-tailoring-response-schema";
export { createCvSectionTailoringResponseSchema } from "./cv-section-tailoring-response-schema";

export type CvSectionTailoringModelOutput = import("zod").infer<
  ReturnType<typeof import("./cv-section-tailoring-response-schema").createCvSectionTailoringResponseSchema>["validator"]
>;
export type CvTailoringModelOutput = import("zod").infer<
  ReturnType<typeof import("./cv-tailoring-response-schema").createCvTailoringResponseSchema>["validator"]
>;
