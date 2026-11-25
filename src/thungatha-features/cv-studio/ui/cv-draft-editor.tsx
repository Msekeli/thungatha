"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CvPdfContent } from "./cv-pdf-document";
import { CvPdfPreview } from "./cv-pdf-preview";
import { CvDraftSummarySection } from "./cv-draft-summary-section";
import { CvDraftExperienceNavigation } from "./cv-draft-experience-navigation";
import { CvDraftExperienceCard } from "./cv-draft-experience-card";
import { CvDraftEditorHeader } from "./cv-draft-editor-header";
import { CvDraftEditorFooter } from "./cv-draft-editor-footer";
import { CvDraftSkillsSection } from "./cv-draft-skills-section";
import { CvDraftRequirementsSection } from "./cv-draft-requirements-section";
import {
  applyCvSuggestion,
  undoCvSuggestion,
} from "../server/apply-cv-suggestion";
import type { CvSuggestion } from "../server/cv-studio-schema";

type CvContent = {
  fullName: string;
  headline: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  professionalSummary: string;
  workExperience: Array<{
    sourceId: string;
    jobTitle: string;
    employer: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    achievements: string[];
  }>;
  projects: Array<{
    sourceId: string;
    name: string;
    role: string | null;
    description: string | null;
    url: string | null;
  }>;
  technicalSkills: string[];
  education: Array<{
    sourceId: string;
    educationLevel: string | null;
    qualification: string;
    institution: string;
    fieldOfStudy: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
  }>;
  certifications: Array<{
    sourceId: string;
    type:
      | "professional-certification"
      | "occupational-certificate"
      | "professional-licence"
      | "drivers-licence"
      | "other"
      | null;
    name: string;
    issuer: string | null;
    issueDate: string | null;
    expiryDate: string | null;
    issuingCountry: string | null;
    licenceCategories: string[];
    endorsements: string | null;
  }>;
  languages: string[];
};
type JobContext = {
  source: "discovery" | "pasted";
  jobId: string | null;
  title: string;
  company: string | null;
  location: string | null;
  sourceUrl: string | null;
  description: string;
  descriptionFingerprint: string;
  retrievedAt: string;
};
type Accent = "teal" | "navy" | "burgundy" | "forest";
type Draft = {
  id: string;
  content: CvContent;
  suggestions: CvSuggestion[];
  tailoring_assessment: {
    gaps: Array<{
      requirement: string;
      explanation: string;
      jobEvidenceRefs: string[];
    }>;
    coveredRequirementIds?: string[];
  } | null;
  accent_colour: Accent;
  version_number: number;
  status: "draft" | "accepted";
};

const accentHex: Record<Accent, string> = {
  teal: "#0F766E",
  navy: "#1D4ED8",
  burgundy: "#9F1239",
  forest: "#166534",
};

export function CvDraftEditor({
  masterVersionId,
  jobContext,
  initialContent,
  startImmediately = false,
  onContentChange,
}: {
  masterVersionId: string;
  jobContext: JobContext;
  initialContent: unknown;
  startImmediately?: boolean;
  onContentChange?: (content: CvPdfContent, accent: string) => void;
}) {
  const createStarted = useRef(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [createFailed, setCreateFailed] = useState(false);
  const [tailoringFailed, setTailoringFailed] = useState(false);
  const [content, setContent] = useState<CvContent>(
    initialContent as CvContent,
  );

  useEffect(() => {
    if (draft?.id)
      onContentChange?.(
        content as unknown as CvPdfContent,
        accentHex[draft.accent_colour],
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
      const response = await fetch("/api/cv-studio/drafts", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterVersionId, jobContext }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error ?? "Draft could not be created.");
      const createdDraft = body.draft as Draft;
      setDraft(createdDraft);
      setSummaryDialogOpen(false);
      setContent(createdDraft.content as CvContent);
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
      const job =
        jobContext.source === "discovery"
          ? { source: "discovery" as const, jobId: jobContext.jobId }
          : {
              source: "pasted" as const,
              title: jobContext.title,
              company: jobContext.company ?? "",
              description: jobContext.description,
            };
      const response = await fetch("/api/cv-studio/drafts/tailor", {
        method: "POST",
        signal: AbortSignal.timeout(180_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId, job, section: "professionalSummary" }),
      });
      const body = await response.json();
      if (!response.ok) {
        const requestId =
          typeof body.requestId === "string"
            ? ` (Request ID: ${body.requestId})`
            : "";
        throw new Error(`${body.error ?? "AI tailoring failed."}${requestId}`);
      }
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
              tailoring_assessment: body.assessment,
            }
          : current,
      );
      setTailoringFailed(false);
      setMessage(
        body.generatedSuggestions?.length
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
      const job =
        jobContext.source === "discovery"
          ? { source: "discovery" as const, jobId: jobContext.jobId }
          : {
              source: "pasted" as const,
              title: jobContext.title,
              company: jobContext.company ?? "",
              description: jobContext.description,
            };
      const response = await fetch("/api/cv-studio/drafts/tailor", {
        method: "POST",
        signal: AbortSignal.timeout(180_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: draft.id,
          job,
          section: "workExperience",
          experienceSourceId: sourceId,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        const requestId =
          typeof body.requestId === "string"
            ? " (Request ID: " + body.requestId + ")"
            : "";
        throw new Error(
          (body.error ?? "Work experience tailoring failed.") + requestId,
        );
      }
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
        body.generatedSuggestions?.length
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
      const saveResponse = await fetch("/api/cv-studio/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          content,
          suggestions: draft.suggestions,
          accentColour: draft.accent_colour,
        }),
      });
      const savedBody = await saveResponse.json();
      if (!saveResponse.ok)
        throw new Error(
          savedBody.error ?? "Save your latest edits before accepting the CV.",
        );
      const response = await fetch("/api/cv-studio/drafts/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error ?? "The CV could not be accepted.");
      setDraft({
        ...draft,
        ...(body.version as Partial<Draft>),        status: "accepted",
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
      const response = await fetch("/api/cv-studio/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          content,
          suggestions: draft.suggestions,
          accentColour: draft.accent_colour,
        }),
      });
      const body = await response.json();
      if (!response.ok)        throw new Error(body.error ?? "Draft could not be saved.");      setDraft(body.draft as Draft);
      setMessage("Draft saved. Review the preview before accepting it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft could not be saved.");
    } finally {
      setBusy(false);
    }  }

  if (draft?.status === "accepted") {
    return (
      <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-6">
        <header className="shrink-0 border-b border-line pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
            CV Studio
          </p>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">Your CV is ready</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Your tailored CV has been accepted and saved. Preview it below or download the PDF.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span aria-hidden="true">✓</span>
            Accepted and saved
          </p>
        </header>
        <div className="min-h-0 flex-1 pt-4">
          <CvPdfPreview
            content={content as unknown as CvPdfContent}
            accent={accentHex[draft.accent_colour]}
            allowDownload
          />
        </div>
      </section>
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
          <div
            className="flex h-full flex-col justify-center gap-4"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">Preparing your tailored CV…</p>
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {createFailed && (
              <Button
                className="w-fit"
                size="sm"
                onClick={() => void createDraft()}
                disabled={busy}
              >
                Retry
              </Button>
            )}
          </div>
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
      {(message || error || draft?.status === "accepted") && (
        <div
          className="shrink-0 border-t border-line px-3 py-2 sm:px-6"
          aria-live="polite"
        >
          {draft?.status === "accepted" ? (
            <p className="text-xs font-medium text-accent-text">
              CV accepted and saved. This version is now available in your saved
              CVs.
            </p>
          ) : message ? (
            <p className="text-xs text-fg-muted">{message}</p>
          ) : null}
          {error && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
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