import type { CvSuggestion } from "../server/cv-studio-schema";
import type { CvDraftContent } from "./cv-draft-content";

type CvDraftAccent = "teal" | "navy" | "burgundy" | "forest";

export type CvDraft = {
  id: string;
  content: CvDraftContent;
  suggestions: CvSuggestion[];
  tailoring_assessment: {
    gaps: Array<{
      requirement: string;
      explanation: string;
      jobEvidenceRefs: string[];
    }>;
    coveredRequirementIds?: string[];
  } | null;
  accent_colour: CvDraftAccent;
  version_number: number;
  status: "draft" | "accepted";
};

export const CV_DRAFT_ACCENT_HEX: Record<CvDraftAccent, string> = {
  teal: "#0F766E",
  navy: "#1D4ED8",
  burgundy: "#9F1239",
  forest: "#166534",
};
