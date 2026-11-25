import type { CvSuggestion } from "../server/cv-studio-schema";
import type { CvDraftContent } from "./cv-draft-content";
import type { CvDraft } from "./cv-draft-types";
import { requestCvDraftJson } from "./cv-draft-api";

export function saveCvDraft(
  id: string,
  content: CvDraftContent,
  suggestions: CvSuggestion[],
  accentColour: CvDraft["accent_colour"],
  fallback = "Draft could not be saved.",
) {
  return requestCvDraftJson<{ draft: CvDraft }>(
    "/api/cv-studio/drafts",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content, suggestions, accentColour }),
    },
    fallback,
  );
}

export function acceptCvDraft(id: string) {
  return requestCvDraftJson<{ version: Partial<CvDraft> }>(
    "/api/cv-studio/drafts/accept",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    },
    "The CV could not be accepted.",
  );
}
