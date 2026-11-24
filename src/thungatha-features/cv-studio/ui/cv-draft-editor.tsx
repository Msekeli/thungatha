"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CvPdfContent } from "./cv-pdf-document";
import { CvAiSuggestions } from "./cv-ai-suggestions";
import { applyCvSuggestion } from "../server/apply-cv-suggestion";
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
    gaps: Array<{ requirement: string; explanation: string; jobEvidenceRefs: string[] }>;
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
    if (draft?.id) onContentChange?.(content as unknown as CvPdfContent, accentHex[draft.accent_colour]);
  }, [content, draft?.id, draft?.accent_colour, onContentChange]);
  const [busy, setBusy] = useState(false);
  const [, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailoringBusy, setTailoringBusy] = useState(false);
  const [, setWorkflowStage] = useState<string | null>(null);
  const [tailoringGaps, setTailoringGaps] = useState<Array<{ requirement: string; explanation: string; jobEvidenceRefs: string[] }>>([]);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"summary" | "experience" | "skills">("summary");

  const reviewSections = [
    { id: "summary" as const, label: "Professional Summary", target: "cv-review-summary" },
    { id: "experience" as const, label: "Work Experience", target: "cv-review-experience" },
    { id: "skills" as const, label: "Skills", target: "cv-review-skills" },
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
      setSummaryDialogOpen(createdDraft.status === "draft");
      setContent(createdDraft.content as CvContent);
      setTailoringGaps(body.draft.tailoring_assessment?.gaps ?? []);
      setMessage(
        body.reusedDraft
          ? "Your existing working draft has been reopened. Your master CV and Profile remain unchanged."
          : "Your separate working draft is ready. Your master CV and Profile remain unchanged.",
      );
      if (
        createdDraft.status === "draft" &&
        createdDraft.suggestions.length === 0 &&
        !createdDraft.tailoring_assessment
      ) {
        await generateSuggestionsForDraft(createdDraft.id);
      }
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
    setWorkflowStage("Analysing the job description and preparing your professional summary…");
    setError(null);
    setMessage(null);
    try {
      const job = jobContext.source === "discovery"
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
        body: JSON.stringify({ draftId, job }),
      });
      const body = await response.json();
      if (!response.ok) {
        const requestId = typeof body.requestId === "string" ? ` (Request ID: ${body.requestId})` : "";
        throw new Error(`${body.error ?? "AI tailoring failed."}${requestId}`);
      }
      setDraft((current) => current ? {
        ...current,
        suggestions: body.suggestions,
        tailoring_assessment: body.assessment,
      } : current);
      setTailoringGaps(body.assessment?.gaps ?? body.gaps ?? []);
      setWorkflowStage(null);
      setTailoringFailed(false);
      setMessage(body.suggestions.length
        ? "Your professional summary proposal is ready. Review it, then accept or reject it."
        : "No summary change was recommended. Your existing summary remains unchanged.");
    } catch (e) {
      setWorkflowStage(null);
      setTailoringFailed(true);
      setError(
        e instanceof DOMException && e.name === "TimeoutError"
          ? "AI tailoring exceeded three minutes. Your draft is still available; retry the summary generation."
          : e instanceof Error ? e.message : "AI summary generation failed.",
      );
    } finally {
      setTailoringBusy(false);
    }
  }

  async function generateSuggestions() {
    if (!draft || draft.status !== "draft") return;
    await generateSuggestionsForDraft(draft.id);
  }

  function decideSuggestion(id: string, decision: "accepted" | "rejected") {
    const suggestion = draft?.suggestions.find((item) => item.id === id);
    if (!suggestion || suggestion.decision !== "pending") return;
    if (decision === "accepted") {
      try {
        const updatedContent = applyCvSuggestion(content, suggestion);
        setContent(updatedContent);
      } catch (e) {
        setError(e instanceof Error ? e.message : "This suggestion can no longer be applied.");
        return;
      }
    }
    if (decision === "accepted") setSummaryDialogOpen(false);
    setDraft((current) => current ? {
      ...current,
      suggestions: current.suggestions.map((item) =>
        item.id === id ? { ...item, decision } : item,
      ),
    } : current);
    setMessage(
      decision === "accepted"
        ? "Summary accepted and applied to the live PDF preview. Save the draft to keep this change."
        : "Summary proposal rejected. The original summary remains in your CV.",
    );
  }

  useEffect(() => {
    if (!startImmediately || createStarted.current) return;
    createStarted.current = true;
    void createDraft();
    // The editor is mounted only after the user chooses Tailor my CV.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startImmediately]);

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
      if (!response.ok)
        throw new Error(body.error ?? "Draft could not be saved.");
      setDraft(body.draft as Draft);
      setMessage("Draft saved. Review the preview before accepting it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft could not be saved.");
    } finally {
      setBusy(false);
    }
  }


  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-sm">
      <header className="shrink-0 border-b border-line px-5 pb-3 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3"><span className="text-2xl text-sky-600" aria-hidden="true">✧</span><h2 className="text-xl font-bold">CV Tailoring</h2></div>
            <p className="mt-1 text-sm text-fg-muted">Review AI suggestions and apply the changes you agree with.</p>
          </div>
          <span className="shrink-0 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold">Step {activeIndex + 1} of 3</span>
        </div>
        <nav aria-label="CV tailoring steps" className="mt-4 grid grid-cols-3 gap-2">
          {reviewSections.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} aria-current={activeSection === item.id ? "step" : undefined}
              className={`flex min-w-0 items-center justify-center gap-2 border-b-2 px-1 pb-3 pt-2 text-xs font-semibold sm:text-sm ${activeSection === item.id ? "border-sky-500 text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}>
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs ${activeSection === item.id ? "border-sky-500 bg-sky-500 text-white" : "border-line bg-panel"}`}>{index + 1}</span><span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6">
        {!draft ? (
          <div className="flex h-full flex-col justify-center gap-4" role="status" aria-live="polite">
            <p className="text-sm font-medium">Preparing your tailored CV…</p><Skeleton className="h-5 w-2/5" /><Skeleton className="h-24 w-full" /><Skeleton className="h-16 w-full" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {createFailed && <Button className="w-fit" size="sm" onClick={() => void createDraft()} disabled={busy}>Retry</Button>}
          </div>
        ) : activeSection === "summary" ? (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="shrink-0"><h3 className="text-lg font-bold">Professional Summary</h3><p className="text-sm text-fg-muted">A suggested improvement to better align your CV with the selected job.</p></div>
            <CvAiSuggestions
              open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}
              suggestions={draft.suggestions.filter((item) => item.targetPath === "professionalSummary")}
              hasCompletedReview={draft.tailoring_assessment !== null}
              generating={tailoringBusy} generationError={tailoringFailed ? error : null}
              disabled={busy || draft.status !== "draft"}
              onAccept={(id) => decideSuggestion(id, "accepted")} onReject={(id) => decideSuggestion(id, "rejected")}
              onRegenerate={() => void generateSuggestions()} onDiscard={() => setSummaryDialogOpen(false)}
            />
            {!summaryDialogOpen && !tailoringBusy && <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={busy || draft.status !== "draft"} onClick={() => void generateSuggestions()}>{pendingSuggestion ? "Review suggestion" : "Generate suggestion"}</Button></div>}
            {error && !tailoringFailed && <p className="text-sm text-destructive" role="alert">{error}</p>}
          </div>
        ) : activeSection === "experience" ? (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="shrink-0"><h3 className="text-lg font-bold">Work Experience</h3><p className="text-sm text-fg-muted">Review the experience included in your tailored CV.</p></div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {content.workExperience.length ? content.workExperience.map((item) => <article key={item.sourceId} className="rounded-xl border border-line bg-panel-2 p-3"><h4 className="text-sm font-semibold">{item.jobTitle}</h4><p className="text-xs text-fg-muted">{item.employer} · {item.startDate} – {item.isCurrent ? "Present" : item.endDate ?? "—"}</p>{item.description && <p className="mt-2 text-sm leading-5">{item.description}</p>}{item.achievements.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{item.achievements.map((achievement, i) => <li key={i}>{achievement}</li>)}</ul>}</article>) : <p className="text-sm text-fg-muted">No work experience is included in this CV.</p>}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-3"><div className="shrink-0"><h3 className="text-lg font-bold">Skills</h3><p className="text-sm text-fg-muted">Review the skills included in your tailored CV.</p></div><div className="flex flex-wrap content-start gap-2">{content.technicalSkills.map((skill) => <span key={skill} className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1.5 text-sm">{skill}</span>)}{!content.technicalSkills.length && <p className="text-sm text-fg-muted">No skills are currently listed.</p>}</div></div>
        )}
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6">
        <Button type="button" variant="outline" disabled={activeIndex === 0} onClick={() => setActiveSection(reviewSections[Math.max(0, activeIndex - 1)].id)}><ArrowLeft className="mr-1 size-4" /> Previous</Button>
        {draft?.status === "draft" && <Button type="button" variant="outline" disabled={busy} onClick={() => void saveDraft()}>{busy ? "Saving…" : "Save draft"}</Button>}
        <Button type="button" disabled={activeIndex === 2} onClick={() => setActiveSection(reviewSections[Math.min(2, activeIndex + 1)].id)}>Next <ArrowRight className="ml-1 size-4" /></Button>
      </footer>
    </section>
  );
}

