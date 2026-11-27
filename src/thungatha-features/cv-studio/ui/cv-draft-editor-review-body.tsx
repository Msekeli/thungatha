"use client";

import { CvDraftSummarySection } from "./cv-draft-summary-section";
import { CvDraftExperienceReview } from "./cv-draft-experience-review";
import { CvDraftSkillsReview } from "./cv-draft-skills-review";
import { CvDraftRequirementsReview } from "./cv-draft-requirements-review";
import type { CvDraft } from "./cv-draft-types";
import type { useCvDraftEditorState } from "./cv-draft-editor-state";

type ReviewBodyProps = {
  state: ReturnType<typeof useCvDraftEditorState> & { draft: CvDraft };
};

export function CvDraftEditorReviewBody({ state }: ReviewBodyProps) {
  const { draft, content, busy, error, activeSection } = state;

  if (activeSection === "summary") {
    return (
      <CvDraftSummarySection
        summary={content.professionalSummary}
        suggestions={draft.suggestions.filter(
          (item) => item.targetPath === "professionalSummary",
        )}
        hasCompletedReview={draft.tailoring_assessment !== null}
        reviewOpen={state.summaryGeneration.reviewOpen}
        generating={state.summaryGeneration.busy}
        generationError={state.summaryGeneration.failed ? error : null}
        disabled={busy || draft.status !== "draft"}
        canUndo={
          state.suggestionDecisions.lastApplied?.targetPath ===
          "professionalSummary"
        }
        error={state.summaryGeneration.failed ? null : error}
        onReviewOpenChange={state.summaryGeneration.setReviewOpen}
        onDecision={state.suggestionDecisions.decide}
        onRegenerate={() => void state.summaryGeneration.generate()}
        onUndo={state.suggestionDecisions.undo}
        onTailor={() => {
          const pending = draft.suggestions.some(
            (item) =>
              item.targetPath === "professionalSummary" &&
              item.decision === "pending",
          );
          if (pending) state.summaryGeneration.setReviewOpen(true);
          else void state.summaryGeneration.generate();
        }}
      />
    );
  }

  if (activeSection === "experience") {
    return (
      <CvDraftExperienceReview
        experiences={content.workExperience}
        activeIndex={state.activeExperienceIndex}
        onIndexChange={state.setActiveExperienceIndex}
        draft={draft}
        busy={busy}
        generation={state.experienceGeneration}
        decisions={state.suggestionDecisions}
      />
    );
  }

  if (activeSection === "skills") {
    return (
      <CvDraftSkillsReview
        skills={content.technicalSkills}
        disabled={busy || draft.status !== "draft"}
        onAddSkill={(skill) =>
          state.setContent((current) => ({
            ...current,
            technicalSkills: [...current.technicalSkills, skill],
          }))
        }
      />
    );
  }

  return <CvDraftRequirementsReview assessment={draft.tailoring_assessment} />;
}
