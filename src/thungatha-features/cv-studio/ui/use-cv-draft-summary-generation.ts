"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { generateCvDraftSuggestions } from "./cv-draft-api";
import type { CvDraftJobContext } from "./cv-draft-content";
import type { CvDraft } from "./cv-draft-types";

type SummaryGenerationProps = {
  draft: CvDraft | null;
  jobContext: CvDraftJobContext;
  setDraft: Dispatch<SetStateAction<CvDraft | null>>;
  setError: (message: string | null) => void;
  setMessage: (message: string | null) => void;
};

export function useCvDraftSummaryGeneration({
  draft, jobContext, setDraft, setError, setMessage,
}: SummaryGenerationProps) {
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  async function generateForDraft(draftId: string) {
    setFailed(false);
    setReviewOpen(true);
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await generateCvDraftSuggestions(
        draftId, jobContext, "professionalSummary",
      );
      setDraft((current) =>
        current ? {
          ...current,
          suggestions: [
            ...current.suggestions.filter(
              (item) => item.targetPath !== "professionalSummary" || item.decision !== "pending",
            ),
            ...body.generatedSuggestions,
          ],
          tailoring_assessment: body.assessment ?? null,
        } : current,
      );
      setMessage(
        body.generatedSuggestions.length
          ? "Your professional summary proposal is ready. Review it, then accept or reject it."
          : "No summary change was recommended. Your existing summary remains unchanged.",
      );
    } catch (cause) {
      setFailed(true);
      setError(
        cause instanceof DOMException && cause.name === "TimeoutError"
          ? "AI tailoring exceeded three minutes. Your draft is still available; retry the summary generation."
          : cause instanceof Error ? cause.message : "AI summary generation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!draft || draft.status !== "draft") return;
    await generateForDraft(draft.id);
  }

  return { failed, busy, reviewOpen, setReviewOpen, generate };
}
