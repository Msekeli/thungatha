import type { CvSuggestion } from "../server/cv-studio-schema";
import type { CvDraftJobContext } from "./cv-draft-content";
import type { CvDraft } from "./cv-draft-types";
import { requestCvDraftJson } from "./cv-draft-request";

type TailorSection = "professionalSummary" | "workExperience";
type JobPayload =
  | { source: "discovery"; jobId: string | null }
  | { source: "pasted"; title: string; company: string; description: string };

function toJobPayload(context: CvDraftJobContext): JobPayload {
  if (context.source === "discovery") {
    return { source: "discovery", jobId: context.jobId };
  }
  return {
    source: "pasted",
    title: context.title,
    company: context.company ?? "",
    description: context.description,
  };
}


export function createCvDraft(
  masterVersionId: string,
  jobContext: CvDraftJobContext,
) {
  return requestCvDraftJson<{ draft: CvDraft; reusedDraft?: boolean }>(
    "/api/cv-studio/drafts",
    {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterVersionId, jobContext }),
    },
    "Draft could not be created.",
  );
}

export function generateCvDraftSuggestions(
  draftId: string,
  jobContext: CvDraftJobContext,
  section: TailorSection,
  experienceSourceId?: string,
) {
  return requestCvDraftJson<{
    generatedSuggestions: CvSuggestion[];
    assessment?: CvDraft["tailoring_assessment"];
  }>(
    "/api/cv-studio/drafts/tailor",
    {
      method: "POST",
      signal: AbortSignal.timeout(180_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftId,
        job: toJobPayload(jobContext),
        section,
        ...(experienceSourceId ? { experienceSourceId } : {}),
      }),
    },
    section === "professionalSummary"
      ? "AI tailoring failed."
      : "Work experience tailoring failed.",
    true,
  );
}
