"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CvPdfPreview } from "./cv-pdf-preview";

type CvContent = {
  fullName: string; headline: string | null; email: string; phone: string | null; location: string | null;
  linkedinUrl: string | null; portfolioUrl: string | null; professionalSummary: string;
  workExperience: Array<{ sourceId: string; jobTitle: string; employer: string; location: string | null; startDate: string; endDate: string | null; isCurrent: boolean; description: string | null; achievements: string[] }>;
  projects: Array<{ sourceId: string; name: string; role: string | null; description: string | null; url: string | null }>;
  technicalSkills: string[];
  education: Array<{ sourceId: string; educationLevel: string | null; qualification: string; institution: string; fieldOfStudy: string | null; startDate: string | null; endDate: string | null; isCurrent: boolean }>;
  certifications: Array<{ sourceId: string; type: "professional-certification" | "occupational-certificate" | "professional-licence" | "drivers-licence" | "other" | null; name: string; issuer: string | null; issueDate: string | null; expiryDate: string | null; issuingCountry: string | null; licenceCategories: string[]; endorsements: string | null }>;
  languages: string[];
};
type JobContext = {
  source: "discovery" | "pasted"; jobId: string | null; title: string; company: string | null;
  location: string | null; sourceUrl: string | null; description: string;
  descriptionFingerprint: string; retrievedAt: string;
};
type Accent = "teal" | "navy" | "burgundy" | "forest";
type Draft = { id: string; content: CvContent; suggestions: Array<never>; accent_colour: Accent; version_number: number; status: "draft" | "accepted" };

const accentHex: Record<Accent, string> = {
  teal: "#0F766E",
  navy: "#1D4ED8",
  burgundy: "#9F1239",
  forest: "#166534",
};

export function CvDraftEditor({ masterVersionId, jobContext, initialContent }: { masterVersionId: string; jobContext: JobContext; initialContent: unknown }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [content, setContent] = useState<CvContent>(initialContent as CvContent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createDraft() {
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/cv-studio/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterVersionId, jobContext }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Draft could not be created.");
      setDraft(body.draft as Draft);
      setContent(body.draft.content as CvContent);
      setMessage(body.reusedDraft ? "Your existing working draft for this exact job has been reopened." : "A separate working draft has been created. Your master CV and Profile remain unchanged.");
    } catch (e) { setError(e instanceof Error ? e.message : "Draft could not be created."); }
    finally { setBusy(false); }
  }

  async function saveDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/cv-studio/drafts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draft.id, content, suggestions: draft.suggestions, accentColour: draft.accent_colour }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Draft could not be saved.");
      setDraft(body.draft as Draft);
      setMessage("Draft saved. Review the preview before accepting it.");
    } catch (e) { setError(e instanceof Error ? e.message : "Draft could not be saved."); }
    finally { setBusy(false); }
  }

  async function acceptDraft() {
    if (!draft || draft.status !== "draft") return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/cv-studio/drafts/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draft.id }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The CV could not be accepted.");
      setDraft({ ...draft, ...(body.version as Partial<Draft>), status: "accepted" });
      setMessage("CV accepted. This version is now immutable and can be downloaded. No job application has been recorded.");
    } catch (e) { setError(e instanceof Error ? e.message : "The CV could not be accepted."); }
    finally { setBusy(false); }
  }

  function updateExperience(index: number, patch: Partial<CvContent["workExperience"][number]>) {
    setContent(current => ({ ...current, workExperience: current.workExperience.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }
  function updateProject(index: number, patch: Partial<CvContent["projects"][number]>) {
    setContent(current => ({ ...current, projects: current.projects.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  return (
    <section className="space-y-6 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">Job-specific CV · M4-C07</p>
          <h3 className="mt-1 text-xl font-semibold">Review your CV for {jobContext.title}</h3>
          <p className="mt-1 text-sm text-fg-muted">Edit the presentation of confirmed Profile facts. These changes never update your Profile or master CV.</p>
        </div>
        {!draft && <Button disabled={busy} onClick={() => void createDraft()}>{busy ? "Preparing…" : "Create editable draft"}</Button>}
        {draft?.status === "draft" && <div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={() => void saveDraft()}>{busy ? "Saving…" : "Save draft"}</Button><Button disabled={busy} onClick={() => void acceptDraft()}>{busy ? "Processing…" : "Accept CV"}</Button></div>}
        {draft?.status === "accepted" && <span className="rounded-full bg-accent-bg px-3 py-1.5 text-sm font-medium text-accent-text">Accepted · Version {draft.version_number}</span>}
      </div>

      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">{error}</p>}
      {message && <p className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted" aria-live="polite">{message}</p>}
      {!draft && <p className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted">A draft is created only when you choose to create one. Existing drafts for this exact job are reused instead of duplicated. AI suggestions remain inactive until an AI provider is selected.</p>}

      {draft && (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="min-w-0 space-y-5">
            <div className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted">
              {draft.status === "accepted" ? "Accepted versions are locked. This exact version is retained for reuse and application tracking." : `Working draft v${draft.version_number} · Not accepted`}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name"><Input disabled={draft.status === "accepted"} value={content.fullName} onChange={e => setContent(v => ({ ...v, fullName: e.target.value }))} /></Field>
              <Field label="Professional headline"><Input disabled={draft.status === "accepted"} value={content.headline ?? ""} onChange={e => setContent(v => ({ ...v, headline: e.target.value || null }))} /></Field>
              <Field label="Email"><Input disabled={draft.status === "accepted"} type="email" value={content.email} onChange={e => setContent(v => ({ ...v, email: e.target.value }))} /></Field>
              <Field label="Phone"><Input disabled={draft.status === "accepted"} value={content.phone ?? ""} onChange={e => setContent(v => ({ ...v, phone: e.target.value || null }))} /></Field>
              <Field label="Location"><Input disabled={draft.status === "accepted"} value={content.location ?? ""} onChange={e => setContent(v => ({ ...v, location: e.target.value || null }))} /></Field>
              <Field label="LinkedIn URL"><Input disabled={draft.status === "accepted"} value={content.linkedinUrl ?? ""} onChange={e => setContent(v => ({ ...v, linkedinUrl: e.target.value || null }))} /></Field>
              <Field label="Portfolio URL"><Input disabled={draft.status === "accepted"} value={content.portfolioUrl ?? ""} onChange={e => setContent(v => ({ ...v, portfolioUrl: e.target.value || null }))} /></Field>
            </div>
            <Field label="Professional summary"><Textarea disabled={draft.status === "accepted"} rows={6} value={content.professionalSummary} onChange={e => setContent(v => ({ ...v, professionalSummary: e.target.value }))} /></Field>
            <Field label="Technical skills" hint="One skill per line."><Textarea disabled={draft.status === "accepted"} rows={4} value={content.technicalSkills.join("\n")} onChange={e => setContent(v => ({ ...v, technicalSkills: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} /></Field>

            <div className="space-y-3">
              <h4 className="font-semibold">Professional experience</h4>
              {content.workExperience.map((item, index) => <div key={item.sourceId} className="space-y-3 rounded-xl border border-line p-4">
                <div><p className="font-medium">{item.jobTitle} · {item.employer}</p><p className="text-xs text-fg-muted">{item.startDate} – {item.isCurrent ? "Present" : item.endDate ?? "End date not supplied"}</p></div>
                <Field label="Description"><Textarea disabled={draft.status === "accepted"} rows={4} value={item.description ?? ""} onChange={e => updateExperience(index, { description: e.target.value || null })} /></Field>
                <Field label="Achievements" hint="One item per line."><Textarea disabled={draft.status === "accepted"} rows={3} value={item.achievements.join("\n")} onChange={e => updateExperience(index, { achievements: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} /></Field>
              </div>)}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Projects</h4>
              {content.projects.map((item, index) => <div key={item.sourceId} className="space-y-3 rounded-xl border border-line p-4">
                <p className="font-medium">{item.name}</p>
                <Field label="Description"><Textarea disabled={draft.status === "accepted"} rows={3} value={item.description ?? ""} onChange={e => updateProject(index, { description: e.target.value || null })} /></Field>
              </div>)}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Education and certifications</h4>
              {content.education.map(item => <div key={item.sourceId} className="rounded-lg border border-line p-3"><p className="font-medium">{item.qualification}</p><p className="text-sm text-fg-muted">{item.institution}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}</p></div>)}
              {content.certifications.map(item => <div key={item.sourceId} className="rounded-lg border border-line p-3"><p className="font-medium">{item.name}</p><p className="text-sm text-fg-muted">{item.issuer ?? "Issuer not supplied"}</p></div>)}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Accent colour">
                <select disabled={draft.status === "accepted"} className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-fg" value={draft.accent_colour} onChange={e => setDraft(v => v ? { ...v, accent_colour: e.target.value as Accent } : v)}>
                  <option value="teal">Teal</option><option value="navy">Navy</option><option value="burgundy">Burgundy</option><option value="forest">Forest</option>
                </select>
              </Field>
              <Field label="Languages" hint="One language per line."><Textarea disabled={draft.status === "accepted"} rows={2} value={content.languages.join("\n")} onChange={e => setContent(v => ({ ...v, languages: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} /></Field>
            </div>
            <p className="rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg-muted">AI suggestions are not generated or displayed until an AI provider is selected. No unsupported job requirement is filled with invented candidate information.</p>
            {draft.status === "draft" && <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => void saveDraft()}>{busy ? "Saving…" : "Save draft"}</Button><Button disabled={busy} onClick={() => void acceptDraft()}>{busy ? "Processing…" : "Accept this CV"}</Button></div>}
          </div>
          <div className="min-w-0 space-y-3 xl:sticky xl:top-4 xl:self-start">
            <div className="flex items-center justify-between gap-3"><h4 className="font-semibold">Live A4 preview</h4><span className="text-xs text-fg-muted">{draft.status === "accepted" ? "Accepted version" : "Unsaved edits appear here"}</span></div>
            <CvPdfPreview content={content} accent={accentHex[draft.accent_colour]} />
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block min-w-0 space-y-1.5"><span className="block text-sm font-medium text-fg">{label}</span>{children}{hint && <span className="block text-xs leading-5 text-fg-muted">{hint}</span>}</label>;
}
