"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { generateCvDraftSuggestions } from "./cv-draft-api";
import type { CvDraftJobContext } from "./cv-draft-content";
import type { CvDraft } from "./cv-draft-types";

type ExperienceGenerationProps = {
  draft: CvDraft | null;
  jobContext: CvDraftJobContext;
  setDraft: Dispatch<SetStateAction<CvDraft | null>>;
  setMessage: (message: string | null) => void;
};

export function useCvDraftExperienceGeneration({
  draft, jobContext, setDraft, setMessage,
}: ExperienceGenerationProps) {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [busyFor, setBusyFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate(sourceId: string) {
    if (!draft || draft.status !== "draft" || busyFor) return;
    const targetPrefix = "workExperience[" + sourceId + "].";
    const existing = draft.suggestions.filter((item) => item.targetPath.startsWith(targetPrefix));
    if (existing.some((item) => item.decision === "pending")) {
      setReviewing(sourceId);
      return;
    }
    setReviewing(sourceId);
    setBusyFor(sourceId);
    setError(null);
    try {
      const body = await generateCvDraftSuggestions(
        draft.id, jobContext, "workExperience", sourceId,
      );
      setDraft((current) =>
        current ? {
          ...current,
          suggestions: [
            ...current.suggestions.filter(
              (item) => !item.targetPath.startsWith(targetPrefix) || item.decision !== "pending",
            ),
            ...body.generatedSuggestions,
          ],
        } : current,
      );
      setMessage(
        body.generatedSuggestions.length
          ? "A proposal for this work experience is ready to review."
          : "No change was recommended for this work experience.",
      );
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "TimeoutError"
          ? "Work experience tailoring exceeded three minutes. Your draft is still available; you can retry."
          : cause instanceof Error ? cause.message : "Work experience tailoring failed.",
      );
    } finally {
      setBusyFor(null);
    }
  }

  return { reviewing, setReviewing, busyFor, error, generate };
}
