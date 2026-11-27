"use client";

import { CvDraftSkillsSection } from "./cv-draft-skills-section";

type CvDraftSkillsReviewProps = {
  skills: string[];
  disabled: boolean;
  onAddSkill: (skill: string) => void;
};

export function CvDraftSkillsReview({
  skills,
  disabled,
  onAddSkill,
}: CvDraftSkillsReviewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 text-fg">
      <div className="shrink-0">
        <h3 className="text-lg font-bold">Skills</h3>
        <p className="text-sm text-fg-muted">
          Review existing skills or add another skill to this CV.
        </p>
      </div>
      <CvDraftSkillsSection
        skills={skills}
        disabled={disabled}
        onAddSkill={onAddSkill}
      />
    </div>
  );
}
