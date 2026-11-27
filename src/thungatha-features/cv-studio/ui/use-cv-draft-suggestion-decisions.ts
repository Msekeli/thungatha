"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  applyCvSuggestion,
  undoCvSuggestion,
} from "../server/apply-cv-suggestion";
import type { CvSuggestion } from "../server/cv-studio-schema";
import type { CvDraftContent } from "./cv-draft-content";
import type { CvDraft } from "./cv-draft-types";

type SuggestionDecisionProps = {
  draft: CvDraft | null;
  content: CvDraftContent;
  setDraft: Dispatch<SetStateAction<CvDraft | null>>;
  setContent: Dispatch<SetStateAction<CvDraftContent>>;
  setSummaryReviewOpen: (open: boolean) => void;
  setExperienceReviewing: (id: string | null) => void;
  setError: (message: string | null) => void;
  setMessage: (message: string | null) => void;
};

export function useCvDraftSuggestionDecisions({
  draft,
  content,
  setDraft,
  setContent,
  setSummaryReviewOpen,
  setExperienceReviewing,
  setError,
  setMessage,
}: SuggestionDecisionProps) {
  const [lastApplied, setLastApplied] = useState<CvSuggestion | null>(null);

  function decide(id: string, decision: "accepted" | "rejected") {
    const suggestion = draft?.suggestions.find((item) => item.id === id);
    if (!suggestion || suggestion.decision !== "pending") return;
    if (decision === "accepted") {
      try {
        setContent(applyCvSuggestion(content, suggestion));
        setLastApplied(suggestion);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "This suggestion can no longer be applied.",
        );
        return;
      }
    }
    if (suggestion.targetPath === "professionalSummary")
      setSummaryReviewOpen(false);
    if (suggestion.targetPath.startsWith("workExperience["))
      setExperienceReviewing(null);
    setDraft((current) =>
      current
        ? {
            ...current,
            suggestions: current.suggestions.map((item) =>
              item.id === id ? { ...item, decision } : item,
            ),
          }
        : current,
    );
    const label =
      suggestion.targetPath === "professionalSummary"
        ? "Professional summary"
        : suggestion.targetPath.startsWith("workExperience[")
          ? "Work experience"
          : "CV section";
    setMessage(
      decision === "accepted"
        ? label +
            " proposal accepted and applied to the live PDF preview. Save the draft to keep this change."
        : label +
            " proposal rejected. The original content remains in your CV.",
    );
  }

  function undo() {
    if (!lastApplied || lastApplied.decision !== "pending") return;
    try {
      setContent((current) => undoCvSuggestion(current, lastApplied));
      setDraft((current) =>
        current
          ? {
              ...current,
              suggestions: current.suggestions.map((item) =>
                item.id === lastApplied.id
                  ? { ...item, decision: "rejected" }
                  : item,
              ),
            }
          : current,
      );
      setMessage(
        "The last accepted change was undone. The original wording is restored in the draft and PDF preview.",
      );
      setLastApplied(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The last change could not be undone.",
      );
    }
  }

  return { lastApplied, decide, undo };
}
