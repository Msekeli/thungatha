import { cvSuggestionSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";

export function createSuggestion(targetPath: string) {
  return cvSuggestionSchema.parse({
    id: "2a89e55e-40cc-4d0f-9c1a-2f735e917db7",
    targetPath,
    originalText: "Original description.",
    proposedText: "Revised evidence-grounded description.",
    reason: "Makes the existing work clearer.",
    evidenceRefs: [
      "cv:workExperience[work-1].description",
      "job:description:0",
    ],
    evidence: [
      {
        ref: "cv:workExperience[work-1].description",
        source: "profile",
        excerpt: "Built internal web applications.",
      },
      {
        ref: "job:description:0",
        source: "job",
        excerpt: "Build internal applications.",
      },
    ],
    decision: "accepted",
  });
}

export function createSummarySuggestion() {
  return cvSuggestionSchema.parse({
    id: "3b89e55e-40cc-4d0f-9c1a-2f735e917db7",
    targetPath: "professionalSummary",
    originalText: "Original summary.",
    proposedText: "A revised, evidence-grounded summary.",
    reason: "Connects confirmed experience to the role.",
    evidenceRefs: ["cv:professionalSummary", "job:description:0"],
    evidence: [
      {
        ref: "cv:professionalSummary",
        source: "profile",
        excerpt: "Original summary.",
      },
      {
        ref: "job:description:0",
        source: "job",
        excerpt: "Build internal applications.",
      },
    ],
    decision: "pending",
  });
}
