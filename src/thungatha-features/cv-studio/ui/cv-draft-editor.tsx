"use client";

import type { CvPdfContent } from "./cv-pdf-document";
import type { CvDraftJobContext } from "./cv-draft-content";
import { CV_DRAFT_ACCENT_HEX } from "./cv-draft-types";
import { CvDraftAcceptedView } from "./cv-draft-accepted-view";
import { CvDraftEditorShell } from "./cv-draft-editor-shell";
import { useCvDraftEditorState } from "./cv-draft-editor-state";

type CvDraftEditorProps = {
  masterVersionId: string;
  jobContext: CvDraftJobContext;
  initialContent: unknown;
  startImmediately?: boolean;
  onContentChange?: (content: CvPdfContent, accent: string) => void;
};

export function CvDraftEditor(props: CvDraftEditorProps) {
  const state = useCvDraftEditorState({
    ...props,
    startImmediately: props.startImmediately ?? false,
  });

  if (state.draft?.status === "accepted") {
    return (
      <CvDraftAcceptedView
        content={state.content as unknown as CvPdfContent}
        accent={CV_DRAFT_ACCENT_HEX[state.draft.accent_colour]}
      />
    );
  }

  return <CvDraftEditorShell state={state} />;
}
