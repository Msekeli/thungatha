"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CvPdfContent } from "./cv-pdf-document";
import type { CvDraftJobContext } from "./cv-draft-content";
import { CV_DRAFT_ACCENT_HEX } from "./cv-draft-types";
import { CvDraftSummarySection } from "./cv-draft-summary-section";
import { CvDraftExperienceNavigation } from "./cv-draft-experience-navigation";
import { CvDraftExperienceCard } from "./cv-draft-experience-card";
import { CvDraftEditorHeader } from "./cv-draft-editor-header";
import { CvDraftEditorFooter } from "./cv-draft-editor-footer";
import { CvDraftSkillsSection } from "./cv-draft-skills-section";
import { CvDraftRequirementsSection } from "./cv-draft-requirements-section";
import { CvDraftAcceptedView } from "./cv-draft-accepted-view";
import { CvDraftLoadingState } from "./cv-draft-loading-state";
import { CvDraftFeedback } from "./cv-draft-feedback";
import { useCvDraftSummaryGeneration } from "./use-cv-draft-summary-generation";
import { useCvDraftExperienceGeneration } from "./use-cv-draft-experience-generation";
import { useCvDraftSuggestionDecisions } from "./use-cv-draft-suggestion-decisions";
import { useCvDraftSession } from "./use-cv-draft-session";
import { useCvDraftPersistence } from "./use-cv-draft-persistence";


export function CvDraftEditor({
  masterVersionId,
  jobContext,
  initialContent,
  startImmediately = false,
  onContentChange,
}: {
  masterVersionId: string;
  jobContext: CvDraftJobContext;
  initialContent: unknown;
  startImmediately?: boolean;
  onContentChange?: (content: CvPdfContent, accent: string) => void;
}) {
  const {
    draft, setDraft, content, setContent, busy, setBusy,
    message, setMessage, error, setError, createFailed, createDraft,
  } = useCvDraftSession({
    masterVersionId, jobContext, initialContent, startImmediately, onContentChange,
  });
  const { saveDraft, acceptDraft } = useCvDraftPersistence({
    draft, content, setDraft, setBusy, setError, setMessage,
  });
  const summaryGeneration = useCvDraftSummaryGeneration({
    draft, jobContext, setDraft, setError, setMessage,
  });
  const experienceGeneration = useCvDraftExperienceGeneration({
    draft, jobContext, setDraft, setMessage,
  });
  const suggestionDecisions = useCvDraftSuggestionDecisions({
    draft, content, setDraft, setContent,
    setSummaryReviewOpen: summaryGeneration.setReviewOpen,
    setExperienceReviewing: experienceGeneration.setReviewing,
    setError, setMessage,
  });
  const [activeSection, setActiveSection] = useState<
    "summary" | "experience" | "skills" | "requirements"
  >("summary");
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);

  const reviewSections = [
    {
      id: "summary" as const,
      label: "Professional Summary",
      target: "cv-review-summary",
    },
    {
      id: "experience" as const,
      label: "Work Experience",
      target: "cv-review-experience",
    },
    { id: "skills" as const, label: "Skills", target: "cv-review-skills" },
    {
      id: "requirements" as const,
      label: "Job Requirements",
      target: "cv-review-requirements",
    },
  ];

  if (draft?.status === "accepted") {
    return (
      <CvDraftAcceptedView
        content={content as unknown as CvPdfContent}
        accent={CV_DRAFT_ACCENT_HEX[draft.accent_colour]}
      />
    );
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-sm">
      <CvDraftEditorHeader
        activeIndex={activeIndex}
        activeSection={activeSection}
        sections={reviewSections}
        onSectionChange={setActiveSection}
      />
      <div className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-6 sm:py-4">
        {!draft ? (
          <CvDraftLoadingState
            error={error}
            createFailed={createFailed}
            busy={busy}
            onRetry={() => void createDraft()}
          />

        ) : activeSection === "summary" ? (
          <CvDraftSummarySection
            summary={content.professionalSummary}
            suggestions={draft.suggestions.filter(
              (item) => item.targetPath === "professionalSummary",
            )}
            hasCompletedReview={draft.tailoring_assessment !== null}
            reviewOpen={summaryGeneration.reviewOpen}
            generating={summaryGeneration.busy}
            generationError={summaryGeneration.failed ? error : null}
            disabled={busy || draft.status !== "draft"}
            canUndo={suggestionDecisions.lastApplied?.targetPath === "professionalSummary"}
            error={summaryGeneration.failed ? null : error}
            onReviewOpenChange={summaryGeneration.setReviewOpen}
            onDecision={suggestionDecisions.decide}
            onRegenerate={() => void summaryGeneration.generate()}
            onUndo={suggestionDecisions.undo}
            onTailor={() => {
              if (
                draft.suggestions.some(
                  (item) =>
                    item.targetPath === "professionalSummary" &&
                    item.decision === "pending",
                )
              ) summaryGeneration.setReviewOpen(true);
              else void summaryGeneration.generate();
            }}
          />

        ) : activeSection === "experience" ? (
          <div className="flex h-full min-h-0 flex-col gap-3 text-fg">
            <div className="shrink-0">
              <h3 className="text-base font-bold sm:text-lg">Work Experience</h3>
              <p className="text-xs text-fg-muted sm:text-sm">
                Review the experience included in your tailored CV.
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 text-fg">
              {content.workExperience.length ? (
                <>
                  <CvDraftExperienceNavigation
                    activeIndex={activeExperienceIndex}
                    total={content.workExperience.length}
                    employer={content.workExperience[activeExperienceIndex]?.employer ?? ""}
                    onPrevious={() => setActiveExperienceIndex((index) => Math.max(0, index - 1))}
                    onNext={() => setActiveExperienceIndex((index) => Math.min(content.workExperience.length - 1, index + 1))}
                  />
                  {content.workExperience[activeExperienceIndex] && (() => {
                    const item = content.workExperience[activeExperienceIndex];
                    const suggestions = draft.suggestions.filter((suggestion) =>
                      suggestion.targetPath.startsWith("workExperience[" + item.sourceId + "]."),
                    );
                    const isTailoring = experienceGeneration.busyFor === item.sourceId;
                    const isReviewing = experienceGeneration.reviewing === item.sourceId;
                    return (
                      <CvDraftExperienceCard
                        item={item}
                        suggestions={suggestions}
                        isTailoring={isTailoring}
                        isReviewing={isReviewing}
                        hasCompletedReview={suggestions.length > 0 || (!isTailoring && !experienceGeneration.error)}
                        tailoringError={experienceGeneration.error}
                        disabled={busy || draft.status !== "draft"}
                        canUndo={suggestionDecisions.lastApplied?.targetPath === "workExperience[" + item.sourceId + "].description"}
                        onUndo={suggestionDecisions.undo}
                        onTailor={() => void experienceGeneration.generate(item.sourceId)}
                        onReviewOpenChange={(open) => experienceGeneration.setReviewing(open ? item.sourceId : null)}
                        onDecision={suggestionDecisions.decide}
                        onRegenerate={() => void experienceGeneration.generate(item.sourceId)}
                      />
                    );
                  })()}
                </>
              ) : (
                <p className="text-sm text-fg-muted">No work experience is included in this CV.</p>
              )}
            </div>
          </div>

        ) : activeSection === "skills" ? (
          <div className="flex h-full min-h-0 flex-col gap-3 text-fg">
            <div className="shrink-0">
              <h3 className="text-lg font-bold">Skills</h3>
              <p className="text-sm text-fg-muted">
                Review existing skills or add another skill to this CV.
              </p>
            </div>
            <CvDraftSkillsSection
              skills={content.technicalSkills}
              disabled={busy || draft.status !== "draft"}
              onAddSkill={(skill) =>
                setContent((current) => ({
                  ...current,
                  technicalSkills: [...current.technicalSkills, skill],
                }))
              }
            />
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="shrink-0">
              <h3 className="text-lg font-bold">Job Requirements</h3>
              <p className="text-sm text-fg-muted">
                Requirements from the job that your confirmed Profile does not
                currently demonstrate. This assessment is informational and does
                not change your CV.
              </p>
            </div>
            <CvDraftRequirementsSection assessment={draft.tailoring_assessment} />
          </div>
        )}
      </div>
      <CvDraftFeedback message={message} error={error} />
      <CvDraftEditorFooter
        activeIndex={activeIndex}
        busy={busy}
        draftStatus={draft?.status ?? null}
        onPrevious={() => setActiveSection(reviewSections[Math.max(0, activeIndex - 1)].id)}
        onSave={() => void saveDraft()}
        onAccept={() => void acceptDraft()}
        onNext={() => setActiveSection(reviewSections[Math.min(3, activeIndex + 1)].id)}
      />
    </section>
  );
}