"use client";

import { useState } from "react";
import type { CvPdfContent } from "./cv-pdf-document";
import type { CvDraftJobContext } from "./cv-draft-content";
import { useCvDraftSession } from "./use-cv-draft-session";
import { useCvDraftPersistence } from "./use-cv-draft-persistence";
import { useCvDraftSummaryGeneration } from "./use-cv-draft-summary-generation";
import { useCvDraftExperienceGeneration } from "./use-cv-draft-experience-generation";
import { useCvDraftSuggestionDecisions } from "./use-cv-draft-suggestion-decisions";

export type CvReviewSectionId = "summary" | "experience" | "skills" | "requirements";
export const cvReviewSections = [
  { id: "summary", label: "Professional Summary", target: "cv-review-summary" },
  { id: "experience", label: "Work Experience", target: "cv-review-experience" },
  { id: "skills", label: "Skills", target: "cv-review-skills" },
  { id: "requirements", label: "Job Requirements", target: "cv-review-requirements" },
] as const;

type CvDraftEditorStateProps = {
  masterVersionId: string;
  jobContext: CvDraftJobContext;
  initialContent: unknown;
  startImmediately: boolean;
  onContentChange?: (content: CvPdfContent, accent: string) => void;
};

export function useCvDraftEditorState(props: CvDraftEditorStateProps) {
  const session = useCvDraftSession(props);
  const persistence = useCvDraftPersistence(session);
  const summaryGeneration = useCvDraftSummaryGeneration({ ...session, jobContext: props.jobContext });
  const experienceGeneration = useCvDraftExperienceGeneration({ ...session, jobContext: props.jobContext });
  const suggestionDecisions = useCvDraftSuggestionDecisions({
    ...session,
    setSummaryReviewOpen: summaryGeneration.setReviewOpen,
    setExperienceReviewing: experienceGeneration.setReviewing,
  });
  const [activeSection, setActiveSection] = useState<CvReviewSectionId>("summary");
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const activeIndex = cvReviewSections.findIndex((item) => item.id === activeSection);

  return {
    ...session, ...persistence, summaryGeneration, experienceGeneration,
    suggestionDecisions, activeSection, setActiveSection, activeExperienceIndex,
    setActiveExperienceIndex, activeIndex, reviewSections: cvReviewSections,
  };
}
