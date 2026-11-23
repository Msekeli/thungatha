"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
type Draft = { id: string; content: CvContent; suggestions: Array<never>; accent_colour: "teal" | "navy" | "burgundy" | "forest"; version_number: number };

export function CvDraftEditor({ masterVersionId, jobContext, initialContent }: { masterVersionId: string; jobContext: JobContext; initialContent: CvContent }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [content, setContent] = useState<CvContent>(initialContent);
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
      setMessage("A separate working draft has been created. Your master CV and Profile remain unchanged.");
    } catch (e) { setError(e instanceof Error ? e.message : "Draft could not be created."); }
    finally { setBusy(false); }
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/cv-studio/drafts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draft.id, content, suggestions: draft.suggestions, accentColour: draft.accent_colour }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Draft could not be saved.");
      setDraft(body.draft as Draft);
      setMessage("Draft saved. It has not been accepted and is not ready for export.");
    } catch (e) { setError(e instanceof Error ? e.message : "Draft could not be saved."); }
    finally { setBusy(false); }
  }

  function updateExperience(index: number, patch: Partial<CvContent["workExperience"][number]>) {
    setContent(current => ({ ...current, workExperience: current.workExperience.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  function updateProject(index: number, patch: Partial<CvContent["projects"][number]>) {
    setContent(current => ({ ...current, projects: current.projects.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Working draft · M4-C07</p><h3 className="mt-1 text-xl font-semibold text-slate-950">Edit your job-specific CV</h3><p className="mt-1 text-sm text-slate-600">Start with a copy of your current master CV for {jobContext.title}. Changes are saved separately.</p></div>
        {!draft && <Button disabled={busy} onClick={() => void createDraft()}>{busy ? "Creating draft…" : "Create editable draft"}</Button>}
        {draft && <Button disabled={busy} onClick={() => void saveDraft()}>{busy ? "Saving…" : "Save draft"}</Button>}
      </div>
      {error && <p className="mt-4 text-sm text-rose-700" role="alert">{error}</p>}
      {message && <p className="mt-4 text-sm text-teal-800" aria-live="polite">{message}</p>}
      {!draft && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">This creates a separate draft from confirmed Profile content. AI suggestions are not generated yet.</p>}
      {draft && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Draft v{draft.version_number} · Not accepted · AI tailoring and suggestion decisions are inactive until an AI provider is selected.</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={content.fullName} onChange={e => setContent(v => ({ ...v, fullName: e.target.value }))} /></Field>
            <Field label="Professional headline"><Input value={content.headline ?? ""} onChange={e => setContent(v => ({ ...v, headline: e.target.value || null }))} /></Field>
            <Field label="Email"><Input type="email" value={content.email} onChange={e => setContent(v => ({ ...v, email: e.target.value }))} /></Field>
            <Field label="Phone"><Input value={content.phone ?? ""} onChange={e => setContent(v => ({ ...v, phone: e.target.value || null }))} /></Field>
          </div>
          <Field label="Professional summary"><Textarea rows={6} value={content.professionalSummary} onChange={e => setContent(v => ({ ...v, professionalSummary: e.target.value }))} /></Field>
          <Field label="Technical skills" hint="One skill per line. These remain candidate-provided facts."><Textarea rows={4} value={content.technicalSkills.join("\n")} onChange={e => setContent(v => ({ ...v, technicalSkills: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} /></Field>
          <div><h4 className="font-semibold text-slate-900">Professional experience</h4><div className="mt-3 space-y-4">{content.workExperience.map((item, index) => <div key={item.sourceId} className="rounded-xl border border-slate-200 p-4"><p className="font-medium text-slate-900">{item.jobTitle} · {item.employer}</p><Field label="Description"><Textarea rows={4} value={item.description ?? ""} onChange={e => updateExperience(index, { description: e.target.value || null })} /></Field><Field label="Achievements" hint="One item per line."><Textarea className="mt-3" rows={3} value={item.achievements.join("\n")} onChange={e => updateExperience(index, { achievements: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} /></Field></div>)}</div></div>
          <div><h4 className="font-semibold text-slate-900">Projects</h4><div className="mt-3 space-y-3">{content.projects.map((item, index) => <div key={item.sourceId} className="rounded-xl border border-slate-200 p-4"><p className="font-medium text-slate-900">{item.name}</p><Field label="Description"><Textarea rows={3} value={item.description ?? ""} onChange={e => updateProject(index, { description: e.target.value || null })} /></Field></div>)}</div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Accent colour"><select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" value={draft.accent_colour} onChange={e => setDraft(v => v ? { ...v, accent_colour: e.target.value as Draft["accent_colour"] } : v)}><option value="teal">Teal</option><option value="navy">Navy</option><option value="burgundy">Burgundy</option><option value="forest">Forest</option></select></Field>
            <Field label="Languages" hint="One language per line."><Textarea rows={2} value={content.languages.join("\n")} onChange={e => setContent(v => ({ ...v, languages: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} /></Field>
          </div>
          <div className="border-t border-slate-200 pt-4"><h4 className="font-semibold text-slate-900">AI suggestions</h4><p className="mt-1 text-sm text-slate-600">No suggestions have been generated. Individual accept/reject controls will appear when evidence-backed AI tailoring is enabled.</p></div>
          <div className="flex justify-end"><Button disabled={busy} onClick={() => void saveDraft()}>{busy ? "Saving…" : "Save working draft"}</Button></div>
        </div>
      )}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="block text-sm font-medium text-slate-800">{label}</span>{children}{hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}</label>;
}
