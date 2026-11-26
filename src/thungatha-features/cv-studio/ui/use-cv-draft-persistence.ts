"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CvDraftContent } from "./cv-draft-content";
import { acceptCvDraft, saveCvDraft } from "./cv-draft-persistence";
import type { CvDraft } from "./cv-draft-types";

type CvDraftPersistenceProps = {
  draft: CvDraft | null;
  content: CvDraftContent;
  setDraft: Dispatch<SetStateAction<CvDraft | null>>;
  setBusy: (busy: boolean) => void;
  setError: (message: string | null) => void;
  setMessage: (message: string | null) => void;
};

export function useCvDraftPersistence({
  draft, content, setDraft, setBusy, setError, setMessage,
}: CvDraftPersistenceProps) {
  async function saveDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await saveCvDraft(
        draft.id, content, draft.suggestions, draft.accent_colour,
      );
      setDraft(body.draft);
      setMessage("Draft saved. Review the preview before accepting it.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Draft could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function acceptDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true);
    setError(null);
    try {
      await saveCvDraft(
        draft.id, content, draft.suggestions, draft.accent_colour,
        "Save your latest edits before accepting the CV.",
      );
      const body = await acceptCvDraft(draft.id);
      setDraft({ ...draft, ...body.version, status: "accepted" });
      setMessage(
        "Your tailored CV has been accepted and saved as a new CV version. The master CV and Profile remain unchanged.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The CV could not be accepted.");
    } finally {
      setBusy(false);
    }
  }

  return { saveDraft, acceptDraft };
}
