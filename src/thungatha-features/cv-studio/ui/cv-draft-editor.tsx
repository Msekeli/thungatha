"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CvPdfContent } from "./cv-pdf-document";
import type { CvDraftContent, CvDraftJobContext } from "./cv-draft-content";
import { CV_DRAFT_ACCENT_HEX } from "./cv-draft-types";
import { createCvDraft, generateCvDraftSuggestions } from "./cv-draft-api";
import { acceptCvDraft, saveCvDraft } from "./cv-draft-persistence";
import type { CvDraft } from "./cv-draft-types";
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
import {
  applyCvSuggestion,
  undoCvSuggestion,
} from "../server/apply-cv-suggestion";
import type { CvSuggestion } from "../server/cv-studio-schema";


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
  const createStarted = useRef(false);
  const [draft, setDraft] = useState<CvDraft | null>(null);
  const [createFailed, setCreateFailed] = useState(false);
  const [tailoringFailed, setTailoringFailed] = useState(false);
  const [content, setContent] = useState<CvDraftContent>(
    initialContent as CvDraftContent,
  );

  useEffect(() => {
    if (draft?.id)
      onContentChange?.(
        content as unknown as CvPdfContent,
        CV_DRAFT_ACCENT_HEX[draft.accent_colour],
      );
  }, [content, draft?.id, draft?.accent_colour, onContentChange]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastAppliedSuggestion, setLastAppliedSuggestion] =
    useState<CvSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailoringBusy, setTailoringBusy] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "summary" | "experience" | "skills" | "requirements"
  >("summary");
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const [experienceDialogOpenFor, setExperienceDialogOpenFor] = useState<
    string | null
  >(null);
  const [experienceTailoringBusyFor, setExperienceTailoringBusyFor] = useState<
    string | null
  >(null);
  const [experienceTailoringError, setExperienceTailoringError] = useState<
    string | null
  >(null);

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

  async function createDraft() {
    setBusy(true);
    setCreateFailed(false);
    setError(null);
    setMessage(null);
    try {
      const body = await createCvDraft(masterVersionId, jobContext);
      setDraft(body.draft);
      setSummaryDialogOpen(false);
      setContent(body.draft.content);
      setMessage(
        body.reusedDraft
          ? "Your existing working draft has been reopened. Your master CV and Profile remain unchanged."
          : "Your separate working draft is ready. Your master CV and Profile remain unchanged.",
      );
    } catch (e) {
      setCreateFailed(true);
      setError(
        e instanceof DOMException && e.name === "TimeoutError"
          ? "Draft creation took longer than 15 seconds. Please retry; your Profile and master CV have not been changed."
          : e instanceof Error
            ? e.message
            : "Draft could not be created.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function generateSuggestionsForDraft(draftId: string) {
    setTailoringFailed(false);
    setSummaryDialogOpen(true);
    setTailoringBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await generateCvDraftSuggestions(
        draftId,
        jobContext,
        "professionalSummary",
      );
      setDraft((current) =>
        current
          ? {
              ...current,
              suggestions: [
                ...current.suggestions.filter(
                  (item) =>
                    item.targetPath !== "professionalSummary" ||
                    item.decision !== "pending",
                ),
                ...body.generatedSuggestions,
              ],
              tailoring_assessment: body.assessment ?? null,
            }
          : current,
      );
      setTailoringFailed(false);
      setMessage(
        body.generatedSuggestions.length
          ? "Your professional summary proposal is ready. Review it, then accept or reject it."
          : "No summary change was recommended. Your existing summary remains unchanged.",
      );
    } catch (e) {
      setTailoringFailed(true);
      setError(
        e instanceof DOMException && e.name === "TimeoutError"
          ? "AI tailoring exceeded three minutes. Your draft is still available; retry the summary generation."
          : e instanceof Error
            ? e.message
            : "AI summary generation failed.",
      );
    } finally {
      setTailoringBusy(false);
    }
  }

  async function generateSuggestions() {
    if (!draft || draft.status !== "draft") return;
    await generateSuggestionsForDraft(draft.id);
  }

  async function generateExperienceSuggestions(sourceId: string) {
    if (!draft || draft.status !== "draft" || experienceTailoringBusyFor)
      return;
    const targetPrefix = "workExperience[" + sourceId + "].";
    const existing = draft.suggestions.filter((item) =>
      item.targetPath.startsWith(targetPrefix),
    );
    if (existing.some((item) => item.decision === "pending")) {
      setExperienceDialogOpenFor(sourceId);
      return;
    }
    setExperienceDialogOpenFor(sourceId);
    setExperienceTailoringBusyFor(sourceId);
    setExperienceTailoringError(null);
    try {
      const body = await generateCvDraftSuggestions(
        draft.id,
        jobContext,
        "workExperience",
        sourceId,
      );
      setDraft((current) =>
        current
          ? {
              ...current,
              suggestions: [
                ...current.suggestions.filter(
                  (item) =>
                    !item.targetPath.startsWith(targetPrefix) ||
                    item.decision !== "pending",
                ),
                ...body.generatedSuggestions,
              ],
            }
          : current,
      );
      setMessage(
        body.generatedSuggestions.length
          ? "A proposal for this work experience is ready to review."
          : "No change was recommended for this work experience.",
      );
    } catch (e) {
      setExperienceTailoringError(
        e instanceof DOMException && e.name === "TimeoutError"
          ? "Work experience tailoring exceeded three minutes. Your draft is still available; you can retry."
          : e instanceof Error
            ? e.message
            : "Work experience tailoring failed.",
      );
    } finally {
      setExperienceTailoringBusyFor(null);
    }
  }

  function decideSuggestion(id: string, decision: "accepted" | "rejected") {
    const suggestion = draft?.suggestions.find((item) => item.id === id);
    if (!suggestion || suggestion.decision !== "pending") return;
    if (decision === "accepted") {
      try {
        const updatedContent = applyCvSuggestion(content, suggestion);
        setContent(updatedContent);
        setLastAppliedSuggestion(suggestion);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "This suggestion can no longer be applied.",
        );
        return;
      }
    }
    if (suggestion.targetPath === "professionalSummary")
      setSummaryDialogOpen(false);
    if (suggestion.targetPath.startsWith("workExperience["))
      setExperienceDialogOpenFor(null);
    setDraft((current) =>
      current
        ? {
            ...current,
            suggestions: current.suggestions.map((item) =>
              item.id === id ? { ...item, decision } : item,
            ),
          }
        : current,
    );
    const sectionLabel =
      suggestion.targetPath === "professionalSummary"
        ? "Professional summary"
        : suggestion.targetPath.startsWith("workExperience[")
          ? "Work experience"
          : "CV section";
    setMessage(
      decision === "accepted"
        ? sectionLabel +
            " proposal accepted and applied to the live PDF preview. Save the draft to keep this change."
        : sectionLabel +
            " proposal rejected. The original content remains in your CV.",
    );
  }

  function undoLastAcceptedSuggestion() {
    if (!lastAppliedSuggestion || lastAppliedSuggestion.decision !== "pending")
      return;
    try {
      setContent((current) => undoCvSuggestion(current, lastAppliedSuggestion));
      setDraft((current) =>
        current
          ? {
              ...current,
              suggestions: current.suggestions.map((item) =>
                item.id === lastAppliedSuggestion.id
                  ? { ...item, decision: "rejected" }
                  : item,
              ),
            }
          : current,
      );
      setMessage(
        "The last accepted change was undone. The original wording is restored in the draft and PDF preview.",
      );
      setLastAppliedSuggestion(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The last change could not be undone.",
      );
    }
  }

  useEffect(() => {
    if (!startImmediately || createStarted.current) return;
    createStarted.current = true;
    void createDraft();
    // The editor is mounted only after the user chooses Tailor my CV.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startImmediately]);

  async function acceptDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true);
    setError(null);
    try {
      await saveCvDraft(
        draft.id,
        content,
        draft.suggestions,
        draft.accent_colour,
        "Save your latest edits before accepting the CV.",
      );
      const body = await acceptCvDraft(draft.id);
      setDraft({
        ...draft,
        ...body.version,
        status: "accepted",
      });
      setMessage(
        "Your tailored CV has been accepted and saved as a new CV version. The master CV and Profile remain unchanged.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The CV could not be accepted.",
      );
    } finally {
      setBusy(false);
    }
  }

  const activeIndex = reviewSections.findIndex(
    (item) => item.id === activeSection,
  );
  async function saveDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body = await saveCvDraft(
        draft.id,
        content,
        draft.suggestions,
        draft.accent_colour,
      );
      setDraft(body.draft);
      setMessage("Draft saved. Review the preview before accepting it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft could not be saved.");
    } finally {
      setBusy(false);
    }
  }

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
            reviewOpen={summaryDialogOpen}
            generating={tailoringBusy}
            generationError={tailoringFailed ? error : null}
            disabled={busy || draft.status !== "draft"}
            canUndo={lastAppliedSuggestion?.targetPath === "professionalSummary"}
            error={tailoringFailed ? null : error}
            onReviewOpenChange={setSummaryDialogOpen}
            onDecision={decideSuggestion}
            onRegenerate={() => void generateSuggestions()}
            onUndo={undoLastAcceptedSuggestion}
            onTailor={() => {
              if (
                draft.suggestions.some(
                  (item) =>
                    item.targetPath === "professionalSummary" &&
                    item.decision === "pending",
                )
              ) setSummaryDialogOpen(true);
              else void generateSuggestions();
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
                    const isTailoring = experienceTailoringBusyFor === item.sourceId;
                    const isReviewing = experienceDialogOpenFor === item.sourceId;
                    return (
                      <CvDraftExperienceCard
                        item={item}
                        suggestions={suggestions}
                        isTailoring={isTailoring}
                        isReviewing={isReviewing}
                        hasCompletedReview={suggestions.length > 0 || (!isTailoring && !experienceTailoringError)}
                        tailoringError={experienceTailoringError}
                        disabled={busy || draft.status !== "draft"}
                        canUndo={lastAppliedSuggestion?.targetPath === "workExperience[" + item.sourceId + "].description"}
                        onUndo={undoLastAcceptedSuggestion}
                        onTailor={() => void generateExperienceSuggestions(item.sourceId)}
                        onReviewOpenChange={(open) => setExperienceDialogOpenFor(open ? item.sourceId : null)}
                        onDecision={decideSuggestion}
                        onRegenerate={() => void generateExperienceSuggestions(item.sourceId)}
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