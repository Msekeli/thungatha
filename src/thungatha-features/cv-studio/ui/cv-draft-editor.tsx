"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
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
    if (draft?.id) onContentChange?.(content as unknown as CvPdfContent, accentHex[draft.accent_colour]);
  }, [content, draft?.id, draft?.accent_colour, onContentChange]);
  const [busy, setBusy] = useState(false);
  const [, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailoringBusy, setTailoringBusy] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"summary" | "experience" | "skills" | "requirements">("summary");
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const [newSkill, setNewSkill] = useState("");
  const [experienceTailorNotice, setExperienceTailorNotice] = useState(false);

  const reviewSections = [
    { id: "summary" as const, label: "Professional Summary", target: "cv-review-summary" },
    { id: "experience" as const, label: "Work Experience", target: "cv-review-experience" },
    { id: "skills" as const, label: "Skills", target: "cv-review-skills" },
    { id: "requirements" as const, label: "Job Requirements", target: "cv-review-requirements" },
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
      setTailoringFailed(false);
      setMessage(body.suggestions.length
        ? "Your professional summary proposal is ready. Review it, then accept or reject it."
        : "No summary change was recommended. Your existing summary remains unchanged.");
    } catch (e) {
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
      if (!saveResponse.ok) throw new Error(savedBody.error ?? "Save your latest edits before accepting the CV.");
      const response = await fetch("/api/cv-studio/drafts/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The CV could not be accepted.");
      setDraft({ ...draft, ...(body.version as Partial<Draft>), status: "accepted" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The CV could not be accepted.");
    } finally {
      setBusy(false);
    }
  }

  const activeIndex = reviewSections.findIndex((item) => item.id === activeSection);
  const pendingSuggestion = draft?.suggestions.some((item) => item.targetPath === "professionalSummary" && item.decision === "pending") ?? false;

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
          <span className="shrink-0 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold">Step {activeIndex + 1} of 4</span>
        </div>
        <nav aria-label="CV tailoring steps" className="mt-4 grid grid-cols-4 gap-2">
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
          <div className="flex h-full min-h-0 flex-col gap-3 text-fg">
            <div className="shrink-0"><h3 className="text-lg font-bold">Professional Summary</h3><p className="text-sm text-fg-muted">Your original summary stays unchanged until you request and accept a proposal.</p></div>
            <section className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-panel-2 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Original summary</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-fg">{content.professionalSummary || "No professional summary is available in the master CV."}</p>
            </section>
            {!summaryDialogOpen && !tailoringBusy && (
              <Button type="button" className="w-fit" disabled={busy || draft.status !== "draft"} onClick={() => { setSummaryDialogOpen(true); if (!pendingSuggestion && !draft.suggestions.some((item) => item.targetPath === "professionalSummary")) void generateSuggestions(); }}>
                {pendingSuggestion ? "Review summary suggestion" : "Tailor professional summary"}
              </Button>
            )}
            {summaryDialogOpen && <CvAiSuggestions
              open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}
              suggestions={draft.suggestions.filter((item) => item.targetPath === "professionalSummary")}
              hasCompletedReview={draft.tailoring_assessment !== null}
              generating={tailoringBusy} generationError={tailoringFailed ? error : null}
              disabled={busy || draft.status !== "draft"}
              onAccept={(id) => decideSuggestion(id, "accepted")} onReject={(id) => decideSuggestion(id, "rejected")}
              onRegenerate={() => void generateSuggestions()} onDiscard={() => setSummaryDialogOpen(false)}
            />}
            {error && !tailoringFailed && <p className="text-sm text-destructive" role="alert">{error}</p>}
          </div>
        ) : activeSection === "experience" ? (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="shrink-0"><h3 className="text-lg font-bold">Work Experience</h3><p className="text-sm text-fg-muted">Review the experience included in your tailored CV.</p></div>
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {content.workExperience.length ? (
                <>
                  <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-fg-muted">Work experience {activeExperienceIndex + 1} of {content.workExperience.length}</p>
                      <p className="truncate text-sm font-semibold">{content.workExperience[activeExperienceIndex]?.employer}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button type="button" size="sm" variant="outline" disabled={activeExperienceIndex === 0} onClick={() => setActiveExperienceIndex((index) => Math.max(0, index - 1))}>Previous</Button>
                      <Button type="button" size="sm" variant="outline" disabled={activeExperienceIndex >= content.workExperience.length - 1} onClick={() => setActiveExperienceIndex((index) => Math.min(content.workExperience.length - 1, index + 1))}>Next</Button>
                    </div>
                  </div>
                  {content.workExperience[activeExperienceIndex] && (() => {
                    const item = content.workExperience[activeExperienceIndex];
                    return (
                      <article key={item.sourceId} className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-panel-2 p-4 text-fg">
                        <h4 className="text-base font-semibold">{item.jobTitle}</h4>
                        <p className="mt-1 text-sm text-fg-muted">{item.employer}{item.location ? ` · ${item.location}` : ""}</p>
                        <p className="mt-1 text-xs text-fg-muted">{item.startDate} – {item.isCurrent ? "Present" : item.endDate ?? "—"}</p>
                        <div className="mt-4 space-y-3">
                          <section>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Original responsibilities / description</h5>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.description || "No description provided."}</p>
                          </section>
                          <section>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Achievements</h5>
                            {item.achievements.length ? <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">{item.achievements.map((achievement, i) => <li key={i}>{achievement}</li>)}</ul> : <p className="mt-2 text-sm text-fg-muted">No achievements listed.</p>}
                          </section>
                        </div>
                        <div className="mt-5 border-t border-line pt-4">
                          <Button type="button" variant="outline" disabled={busy || draft.status !== "draft"} onClick={() => setExperienceTailorNotice(true)}>Tailor this experience</Button>
                          {experienceTailorNotice && <p className="mt-2 text-xs text-fg-muted" role="status">Section-specific work-experience tailoring will be connected when the backend workflow is implemented. Your original experience remains unchanged.</p>}
                        </div>
                      </article>
                    );
                  })()}
                </>
              ) : <p className="text-sm text-fg-muted">No work experience is included in this CV.</p>}
            </div>
          </div>
        ) : activeSection === "skills" ? (
          <div className="flex h-full min-h-0 flex-col gap-3 text-fg">
            <div className="shrink-0"><h3 className="text-lg font-bold">Skills</h3><p className="text-sm text-fg-muted">Review existing skills or add another skill to this CV.</p></div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
              <div className="flex flex-wrap content-start gap-2">
                {content.technicalSkills.map((skill, index) => <span key={`${skill}-${index}`} className="rounded-full border border-accent/30 bg-accent-bg px-3 py-1.5 text-sm text-fg">{skill}</span>)}
                {!content.technicalSkills.length && <p className="text-sm text-fg-muted">No skills are currently listed.</p>}
              </div>
              <form className="flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); const value = newSkill.trim(); if (!value || content.technicalSkills.some((skill) => skill.toLowerCase() === value.toLowerCase())) return; setContent((current) => ({ ...current, technicalSkills: [...current.technicalSkills, value] })); setNewSkill(""); }}>
                <input value={newSkill} onChange={(event) => setNewSkill(event.target.value)} maxLength={50} placeholder="Add a skill" aria-label="New skill" className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                <Button type="submit" variant="outline" disabled={!newSkill.trim() || busy || draft.status !== "draft"}><Plus className="mr-1 size-4" /> Add skill</Button>
              </form>
              <p className="text-xs text-fg-muted">Only add skills you genuinely have. Added skills update this draft and its PDF preview when saved.</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="shrink-0"><h3 className="text-lg font-bold">Job Requirements</h3><p className="text-sm text-fg-muted">Requirements from the job that your confirmed Profile does not currently demonstrate. This assessment is informational and does not change your CV.</p></div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {draft.tailoring_assessment?.gaps.length ? draft.tailoring_assessment.gaps.map((gap, index) => (
                <article key={index} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-2"><span className="mt-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700">Not demonstrated</span><h4 className="text-sm font-semibold">{gap.requirement}</h4></div>
                  <p className="mt-2 text-sm leading-5 text-fg-muted">{gap.explanation}</p>
                </article>
              )) : (
                <div className="rounded-xl border border-line bg-panel-2 p-4">
                  <p className="text-sm font-medium">{draft.tailoring_assessment ? "No outstanding requirements were identified." : "The job requirements assessment is not available yet."}</p>
                  <p className="mt-1 text-sm text-fg-muted">{draft.tailoring_assessment ? "The current assessment did not identify any requirements missing from the confirmed Profile evidence." : "This section will display requirements that the current CV does not demonstrate once assessment data is available."}</p>
                </div>
              )}
              <p className="text-xs text-fg-muted">“Not demonstrated” means the information was not found in the confirmed Profile evidence. It does not prove that you do not have the qualification or experience.</p>
            </div>
          </div>
        )}
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6">
        <Button type="button" variant="outline" disabled={activeIndex === 0} onClick={() => setActiveSection(reviewSections[Math.max(0, activeIndex - 1)].id)}><ArrowLeft className="mr-1 size-4" /> Previous</Button>
        {draft?.status === "draft" && <Button type="button" variant="outline" disabled={busy} onClick={() => void saveDraft()}>{busy ? "Saving…" : "Save draft"}</Button>}
        {activeIndex === 3 ? <Button type="button" disabled={busy || draft?.status !== "draft"} onClick={() => void acceptDraft()}>{busy ? "Saving…" : "Accept CV"}</Button> : <Button type="button" onClick={() => setActiveSection(reviewSections[Math.min(3, activeIndex + 1)].id)}>Next <ArrowRight className="ml-1 size-4" /></Button>}
      </footer>
    </section>
  );
}

