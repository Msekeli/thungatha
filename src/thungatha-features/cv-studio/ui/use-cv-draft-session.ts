"use client";

import { useEffect, useRef, useState } from "react";
import type { CvPdfContent } from "./cv-pdf-document";
import type { CvDraftContent, CvDraftJobContext } from "./cv-draft-content";
import { createCvDraft } from "./cv-draft-api";
import { CV_DRAFT_ACCENT_HEX } from "./cv-draft-types";
import type { CvDraft } from "./cv-draft-types";

type CvDraftSessionProps = {
  masterVersionId: string;
  jobContext: CvDraftJobContext;
  initialContent: unknown;
  startImmediately: boolean;
  onContentChange?: (content: CvPdfContent, accent: string) => void;
};

export function useCvDraftSession({
  masterVersionId, jobContext, initialContent, startImmediately, onContentChange,
}: CvDraftSessionProps) {
  const createStarted = useRef(false);
  const [draft, setDraft] = useState<CvDraft | null>(null);
  const [createFailed, setCreateFailed] = useState(false);
  const [content, setContent] = useState<CvDraftContent>(initialContent as CvDraftContent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft?.id) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        onContentChange?.(
          content as unknown as CvPdfContent,
          CV_DRAFT_ACCENT_HEX[draft.accent_colour],
        );
      }
    });
    return () => { active = false; };
  }, [content, draft?.id, draft?.accent_colour, onContentChange]);

  async function createDraft() {
    setBusy(true);
    setCreateFailed(false);
    setError(null);
    setMessage(null);
    try {
      const body = await createCvDraft(masterVersionId, jobContext);
      setDraft(body.draft);
      setContent(body.draft.content);
      setMessage(body.reusedDraft
        ? "Your existing working draft has been reopened. Your master CV and Profile remain unchanged."
        : "Your separate working draft is ready. Your master CV and Profile remain unchanged.");
    } catch (cause) {
      setCreateFailed(true);
      setError(
        cause instanceof DOMException && cause.name === "TimeoutError"
          ? "Draft creation took longer than 15 seconds. Please retry; your Profile and master CV have not been changed."
          : cause instanceof Error ? cause.message : "Draft could not be created.",
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!startImmediately || createStarted.current) return;
    createStarted.current = true;
    void Promise.resolve().then(createDraft);
    // The editor is mounted only after the user chooses Tailor my CV.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startImmediately]);

  return {
    draft, setDraft, content, setContent, busy, setBusy,
    message, setMessage, error, setError, createFailed, createDraft,
  };
}
