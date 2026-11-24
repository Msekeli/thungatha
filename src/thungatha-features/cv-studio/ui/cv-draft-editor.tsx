"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailoringBusy, setTailoringBusy] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<string | null>(null);
  const [tailoringGaps, setTailoringGaps] = useState<Array<{ requirement: string; explanation: string; jobEvidenceRefs: string[] }>>([]);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"summary" | "experience" | "skills">("summary");

  const reviewSections = [
    { id: "summary" as const, label: "Professional Summary", target: "cv-review-summary" },
    { id: "experience" as const, label: "Work Experience", target: "cv-review-experience" },
    { id: "skills" as const, label: "Skills", target: "cv-review-skills" },
  ];

  function navigateReviewSection(next: "summary" | "experience" | "skills") {
    setActiveSection(next);
    window.requestAnimationFrame(() => {
      window.document.getElementById(`cv-review-${next}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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

  async function acceptDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true);
    setError(null);
    setMessage(null);
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
        ...(body.version as Partial<Draft>),
        status: "accepted",
      });
      setMessage(
        "CV accepted. This version is now immutable and can be downloaded. No job application has been recorded.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The CV could not be accepted.",
      );
    } finally {
      setBusy(false);
    }
  }

  function updateExperience(
    index: number,
    patch: Partial<CvContent["workExperience"][number]>,
  ) {
    setContent((current) => ({
      ...current,
      workExperience: current.workExperience.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }
  function updateProject(
    index: number,
    patch: Partial<CvContent["projects"][number]>,
  ) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  return (
    <section className="min-w-0 space-y-5 rounded-2xl border border-line bg-panel p-4 text-fg shadow-sm sm:space-y-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
            Job-specific CV · M4-C07
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            Review your CV for {jobContext.title}
          </h3>
          <p className="mt-1 text-sm text-fg-muted">
            Edit the presentation of confirmed Profile facts. These changes
            never update your Profile or master CV.
          </p>
        </div>
        {!draft && (
          <span className="text-sm text-fg-muted">
            {busy ? "Preparing your CV editor…" : "Preparing your CV editor…"}
          </span>
        )}
        {draft?.status === "accepted" && (
          <span className="rounded-full bg-accent-bg px-3 py-1.5 text-sm font-medium text-accent-text">
            Accepted · Version {draft.version_number}
          </span>
        )}
      </div>

      {error && !draft && createFailed && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="min-w-0 flex-1 text-sm text-destructive" role="alert">{error}</p>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void createDraft()}>Retry draft creation</Button>
        </div>
      )}
      {error && (draft || !createFailed) && (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {(busy || tailoringBusy) && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent-bg/40 p-4 text-sm" role="status" aria-live="polite">
          <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-accent" />
          <span>{workflowStage ?? (busy ? "Creating your tailored CV draft…" : "Preparing your summary…")}</span>
        </div>
      )}
      {message && (
        <p
          className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      {draft && tailoringFailed && !tailoringBusy && draft.status === "draft" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => void generateSuggestions()} disabled={busy || tailoringBusy}>Retry summary generation</Button>
        </div>
      )}
      {draft && (
        <>
          <div className="grid min-w-0 gap-4 sm:gap-6">
          <div className="min-w-0 space-y-5">
            <nav aria-label="CV tailoring sections" className="sticky top-0 z-20 rounded-xl border border-line bg-panel p-2 shadow-sm">
              <div className="grid grid-cols-3 gap-1">
                {reviewSections.map((item) => (
                  <button key={item.id} type="button" onClick={() => navigateReviewSection(item.id)} aria-current={activeSection === item.id ? "step" : undefined} className={`min-h-11 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${activeSection === item.id ? "bg-accent text-white" : "text-fg-muted hover:bg-panel-2 hover:text-fg"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-line px-1 pt-2">
                <span className="text-xs text-fg-muted">Step {reviewSections.findIndex((item) => item.id === activeSection) + 1} of 3</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={activeSection === "summary"} onClick={() => navigateReviewSection(reviewSections[Math.max(0, reviewSections.findIndex((item) => item.id === activeSection) - 1)].id)}><ArrowLeft className="mr-1 size-4" /> Previous</Button>
                  <Button type="button" size="sm" disabled={activeSection === "skills"} onClick={() => navigateReviewSection(reviewSections[Math.min(2, reviewSections.findIndex((item) => item.id === activeSection) + 1)].id)}>Next <ArrowRight className="ml-1 size-4" /></Button>
                </div>
              </div>
            </nav>
            <div className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted">
              {draft.status === "accepted"
                ? "Accepted versions are locked. This exact version is retained for reuse and application tracking."
                : `Working draft v${draft.version_number} · Not accepted`}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  disabled={draft.status === "accepted"}
                  value={content.fullName}
                  onChange={(e) =>
                    setContent((v) => ({ ...v, fullName: e.target.value }))
                  }
                />
              </Field>
              <Field label="Professional headline">
                <Input
                  disabled={draft.status === "accepted"}
                  value={content.headline ?? ""}
                  onChange={(e) =>
                    setContent((v) => ({
                      ...v,
                      headline: e.target.value || null,
                    }))
                  }
                />
              </Field>
              <Field label="Email">
                <Input
                  disabled={draft.status === "accepted"}
                  type="email"
                  value={content.email}
                  onChange={(e) =>
                    setContent((v) => ({ ...v, email: e.target.value }))
                  }
                />
              </Field>
              <Field label="Phone">
                <Input
                  disabled={draft.status === "accepted"}
                  value={content.phone ?? ""}
                  onChange={(e) =>
                    setContent((v) => ({ ...v, phone: e.target.value || null }))
                  }
                />
              </Field>
              <Field label="Location">
                <Input
                  disabled={draft.status === "accepted"}
                  value={content.location ?? ""}
                  onChange={(e) =>
                    setContent((v) => ({
                      ...v,
                      location: e.target.value || null,
                    }))
                  }
                />
              </Field>
              <Field label="LinkedIn URL">
                <Input
                  disabled={draft.status === "accepted"}
                  value={content.linkedinUrl ?? ""}
                  onChange={(e) =>
                    setContent((v) => ({
                      ...v,
                      linkedinUrl: e.target.value || null,
                    }))
                  }
                />
              </Field>
              <Field label="Portfolio URL">
                <Input
                  disabled={draft.status === "accepted"}
                  value={content.portfolioUrl ?? ""}
                  onChange={(e) =>
                    setContent((v) => ({
                      ...v,
                      portfolioUrl: e.target.value || null,
                    }))
                  }
                />
              </Field>
            </div>
            <section id="cv-review-summary" className="scroll-mt-28 space-y-3 rounded-xl border border-line bg-panel-2 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">AI-assisted tailoring</p>
                <h4 className="mt-1 font-semibold">Professional summary</h4>
                <p className="mt-1 text-sm text-fg-muted">Generate one job-specific paragraph using confirmed Profile evidence. Review it here before applying it to this CV draft.</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-fg-muted">{tailoringBusy ? "Generating your professional summary…" : draft.suggestions.some((item) => item.decision === "accepted") ? "A tailored summary has been applied to this draft." : draft.suggestions.some((item) => item.decision === "pending") ? "A proposal is ready for your review." : draft.tailoring_assessment ? "No proposal is currently applied." : "Your current summary is unchanged."}</p>
                <Button type="button" variant="outline" disabled={busy || draft.status !== "draft"} onClick={() => {
                  if (draft.suggestions.some((item) => item.decision === "pending" || item.decision === "rejected")) setSummaryDialogOpen(true);
                  else void generateSuggestions();
                }}>{draft.suggestions.some((item) => item.decision === "pending" || item.decision === "rejected") ? "Review proposal" : "Generate professional summary"}</Button>
              </div>
            </section>
            <CvAiSuggestions
              open={summaryDialogOpen}
              onOpenChange={setSummaryDialogOpen}
              suggestions={draft.suggestions.filter((item) => item.targetPath === "professionalSummary")}
              gaps={tailoringGaps}
              hasCompletedReview={draft.tailoring_assessment !== null}
              generating={tailoringBusy}
              generationError={tailoringFailed ? error : null}
              disabled={busy || draft.status !== "draft"}
              onAccept={(id) => decideSuggestion(id, "accepted")}
              onReject={(id) => decideSuggestion(id, "rejected")}
              onRegenerate={() => void generateSuggestions()}
              onDiscard={() => setSummaryDialogOpen(false)}
            />
            <Field label="Professional summary">
              <Textarea
                disabled={draft.status === "accepted"}
                rows={6}
                value={content.professionalSummary}
                onChange={(e) =>
                  setContent((v) => ({
                    ...v,
                    professionalSummary: e.target.value,
                  }))
                }
              />
            </Field>
            <div id="cv-review-experience" className="scroll-mt-28 space-y-3">
              <h4 className="font-semibold">Professional experience</h4>
              {content.workExperience.map((item, index) => (
                <div
                  key={item.sourceId}
                  className="space-y-3 rounded-xl border border-line p-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.jobTitle} · {item.employer}
                    </p>
                    <p className="text-xs text-fg-muted">
                      {item.startDate} –{" "}
                      {item.isCurrent
                        ? "Present"
                        : (item.endDate ?? "End date not supplied")}
                    </p>
                  </div>
                  <Field label="Description">
                    <Textarea
                      disabled={draft.status === "accepted"}
                      rows={4}
                      value={item.description ?? ""}
                      onChange={(e) =>
                        updateExperience(index, {
                          description: e.target.value || null,
                        })
                      }
                    />
                  </Field>
                  <Field label="Achievements" hint="One item per line.">
                    <Textarea
                      disabled={draft.status === "accepted"}
                      rows={3}
                      value={item.achievements.join("\n")}
                      onChange={(e) =>
                        updateExperience(index, {
                          achievements: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div id="cv-review-skills" className="scroll-mt-28"><Field label="Skills" hint="One skill per line.">
              <Textarea
                disabled={draft.status === "accepted"}
                rows={4}
                value={content.technicalSkills.join("\n")}
                onChange={(e) =>
                  setContent((v) => ({
                    ...v,
                    technicalSkills: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </Field></div>

            <div className="space-y-3">
              <h4 className="font-semibold">Projects</h4>
              {content.projects.map((item, index) => (
                <div
                  key={item.sourceId}
                  className="space-y-3 rounded-xl border border-line p-4"
                >
                  <p className="font-medium">{item.name}</p>
                  <Field label="Description">
                    <Textarea
                      disabled={draft.status === "accepted"}
                      rows={3}
                      value={item.description ?? ""}
                      onChange={(e) =>
                        updateProject(index, {
                          description: e.target.value || null,
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Education and certifications</h4>
              {content.education.map((item) => (
                <div
                  key={item.sourceId}
                  className="rounded-lg border border-line p-3"
                >
                  <p className="font-medium">{item.qualification}</p>
                  <p className="text-sm text-fg-muted">
                    {item.institution}
                    {item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
                  </p>
                </div>
              ))}
              {content.certifications.map((item) => (
                <div
                  key={item.sourceId}
                  className="rounded-lg border border-line p-3"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-fg-muted">
                    {item.issuer ?? "Issuer not supplied"}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Accent colour">
                <select
                  disabled={draft.status === "accepted"}
                  className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-fg"
                  value={draft.accent_colour}
                  onChange={(e) =>
                    setDraft((v) =>
                      v ? { ...v, accent_colour: e.target.value as Accent } : v,
                    )
                  }
                >
                  <option value="teal">Teal</option>
                  <option value="navy">Navy</option>
                  <option value="burgundy">Burgundy</option>
                  <option value="forest">Forest</option>
                </select>
              </Field>
              <Field label="Languages" hint="One language per line.">
                <Textarea
                  disabled={draft.status === "accepted"}
                  rows={2}
                  value={content.languages.join("\n")}
                  onChange={(e) =>
                    setContent((v) => ({
                      ...v,
                      languages: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </Field>
            </div>
            {draft.status === "draft" && (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void saveDraft()}
                >
                  {busy ? "Saving…" : "Save version"}
                </Button>
                <Button className="w-full sm:w-auto" disabled={busy} onClick={() => void acceptDraft()}>
                  {busy ? "Processing…" : "Accept CV"}
                </Button>
              </div>
            )}
          </div>
          </div>
        </>
      )}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const activeIndex = reviewSections.findIndex((item) => item.id === activeSection);
  const pendingSuggestion = draft?.suggestions.some((item) => item.targetPath === "professionalSummary" && item.decision === "pending") ?? false;

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
              gaps={tailoringGaps} hasCompletedReview={draft.tailoring_assessment !== null}
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
}
