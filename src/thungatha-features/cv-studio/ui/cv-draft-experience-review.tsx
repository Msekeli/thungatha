"use client";

import { CvDraftExperienceNavigation } from "./cv-draft-experience-navigation";
import { CvDraftExperienceCard } from "./cv-draft-experience-card";
import type { CvDraftContent } from "./cv-draft-content";
import type { CvDraft } from "./cv-draft-types";
import type { useCvDraftExperienceGeneration } from "./use-cv-draft-experience-generation";
import type { useCvDraftSuggestionDecisions } from "./use-cv-draft-suggestion-decisions";

type ExperienceReviewProps = {
  experiences: CvDraftContent["workExperience"];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  draft: CvDraft;
  busy: boolean;
  generation: ReturnType<typeof useCvDraftExperienceGeneration>;
  decisions: ReturnType<typeof useCvDraftSuggestionDecisions>;
};

export function CvDraftExperienceReview({
  experiences, activeIndex, onIndexChange, draft, busy, generation, decisions,
}: ExperienceReviewProps) {
  const item = experiences[activeIndex];
  const suggestions = item
    ? draft.suggestions.filter((suggestion) =>
        suggestion.targetPath.startsWith("workExperience[" + item.sourceId + "]."),
      )
    : [];
  const isTailoring = item ? generation.busyFor === item.sourceId : false;
  const isReviewing = item ? generation.reviewing === item.sourceId : false;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 text-fg">
      <div className="shrink-0">
        <h3 className="text-base font-bold sm:text-lg">Work Experience</h3>
        <p className="text-xs text-fg-muted sm:text-sm">
          Review the experience included in your tailored CV.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 text-fg">
        {item ? (
          <>
            <CvDraftExperienceNavigation
              activeIndex={activeIndex}
              total={experiences.length}
              employer={item.employer}
              onPrevious={() => onIndexChange(Math.max(0, activeIndex - 1))}
              onNext={() => onIndexChange(Math.min(experiences.length - 1, activeIndex + 1))}
            />
            <CvDraftExperienceCard
              item={item}
              suggestions={suggestions}
              isTailoring={isTailoring}
              isReviewing={isReviewing}
              hasCompletedReview={suggestions.length > 0 || (!isTailoring && !generation.error)}
              tailoringError={generation.error}
              disabled={busy || draft.status !== "draft"}
              canUndo={decisions.lastApplied?.targetPath === "workExperience[" + item.sourceId + "].description"}
              onUndo={decisions.undo}
              onTailor={() => void generation.generate(item.sourceId)}
              onReviewOpenChange={(open) => generation.setReviewing(open ? item.sourceId : null)}
              onDecision={decisions.decide}
              onRegenerate={() => void generation.generate(item.sourceId)}
            />
          </>
        ) : (
          <p className="text-sm text-fg-muted">No work experience is included in this CV.</p>
        )}
      </div>
    </div>
  );
}
