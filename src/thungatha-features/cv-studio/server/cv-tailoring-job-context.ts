import type { JobMatchingContext } from "@/thungatha-features/job-discovery/server/job-ai-queue-eligibility";
import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";
import type { CvTailoringJob } from "./cv-tailoring-service-types";

export function toJobMatchingContext(job: CvTailoringJob): JobMatchingContext {
  return {
    title: job.title,
    employerName: job.company,
    locationText: job.location,
    description: job.description,
  };
}

export function compactRequirements(requirements: JobUnderstanding["requirements"]) {
  return requirements.map((item) => [
    item.id,
    item.statement.slice(0, 120),
    item.category,
    item.importance,
    item.sourceEvidenceRefs.slice(0, 2),
  ]);
}
