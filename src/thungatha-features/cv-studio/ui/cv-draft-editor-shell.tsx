"use client";

import { CvDraftEditorHeader } from "./cv-draft-editor-header";
import { CvDraftEditorFooter } from "./cv-draft-editor-footer";
import { CvDraftLoadingState } from "./cv-draft-loading-state";
import { CvDraftFeedback } from "./cv-draft-feedback";
import { CvDraftEditorReviewBody } from "./cv-draft-editor-review-body";
import type { CvDraft } from "./cv-draft-types";
import type { useCvDraftEditorState } from "./cv-draft-editor-state";

type CvDraftEditorShellProps = {
  state: ReturnType<typeof useCvDraftEditorState>;
};

export function CvDraftEditorShell({ state }: CvDraftEditorShellProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-sm max-[700px]:h-auto max-[700px]:overflow-visible">
      <CvDraftEditorHeader
        activeIndex={state.activeIndex}
        activeSection={state.activeSection}
        sections={state.reviewSections}
        onSectionChange={state.setActiveSection}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-6 sm:py-4 max-[700px]:flex-none max-[700px]:overflow-visible">
        {state.draft ? (
          <CvDraftEditorReviewBody state={{ ...state, draft: state.draft as CvDraft }} />
        ) : (
          <CvDraftLoadingState
            error={state.error}
            createFailed={state.createFailed}
            busy={state.busy}
            onRetry={() => void state.createDraft()}
          />
        )}
      </div>
      <CvDraftFeedback message={state.message} error={state.error} />
      <CvDraftEditorFooter
        activeIndex={state.activeIndex}
        busy={state.busy}
        draftStatus={state.draft?.status ?? null}
        onPrevious={() => state.setActiveSection(state.reviewSections[Math.max(0, state.activeIndex - 1)].id)}
        onSave={() => void state.saveDraft()}
        onAccept={() => void state.acceptDraft()}
        onNext={() => state.setActiveSection(state.reviewSections[Math.min(3, state.activeIndex + 1)].id)}
      />
    </section>
  );
}
