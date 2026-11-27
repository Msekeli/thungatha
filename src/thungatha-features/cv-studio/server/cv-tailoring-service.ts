import "server-only";
import { getOrCreateJobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-understanding-cache";
import type { CvContent } from "./cv-studio-schema";
import { toJobMatchingContext } from "./cv-tailoring-job-context";
import { generateCvTailoringSuggestionsFromUnderstanding } from "./cv-tailoring-summary-service";
import { generateCvWorkExperienceSuggestions } from "./cv-tailoring-experience-service";
import type { CvTailoringJob } from "./cv-tailoring-service-types";

export type { CvTailoringJob } from "./cv-tailoring-service-types";

export async function generateCvTailoringSuggestions(
  masterContent: CvContent,
  draftContent: CvContent,
  job: CvTailoringJob,
) {
  const understanding = await getOrCreateJobUnderstanding(
    toJobMatchingContext(job),
  );
  return generateCvTailoringSuggestionsFromUnderstanding(
    masterContent,
    draftContent,
    job,
    understanding.analysis,
  );
}

export { generateCvTailoringSuggestionsFromUnderstanding };
export { generateCvWorkExperienceSuggestions };
