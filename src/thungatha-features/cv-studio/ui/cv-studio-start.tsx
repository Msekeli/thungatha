"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CvDraftEditor } from "./cv-draft-editor";
import { CvPdfPreview } from "./cv-pdf-preview";
import { CvDraftEditor } from "./cv-draft-editor";

type CvContent = {
  fullName: string;
  headline: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  professionalSummary: string;
  workExperience: Array<{ sourceId: string; jobTitle: string; employer: string; startDate: string; endDate: string | null; isCurrent: boolean; description: string | null; achievements: string[] }>;
  projects: Array<{ sourceId: string; name: string; role: string | null; description: string | null }>;
  technicalSkills: string[];
  education: Array<{ sourceId: string; qualification: string; institution: string; fieldOfStudy: string | null }>;
  certifications: Array<{ sourceId: string; name: string; issuer: string | null }>;
  languages: string[];
};

type MasterCv = { id: string; content: CvContent; source_profile_version?: number; version_number?: number };
type JobContext = {
  source: "discovery" | "pasted";
  jobId: string | null;
  title: string;
  company: string | null;
  location: string | null;
  sourceUrl: string | null;
  description: string;
  descriptionFingerprint: string;
};
type MatchingVersion = { id: string; versionNumber: number; updatedAt: string; accentColour: string };
type ReusableCv = { id: string; version_number: number; content: CvContent; accent_colour: "teal" | "navy" | "burgundy" | "forest" };
type Suitability = {
  status: "existing_version_found" | "new_version_recommended" | "assessment_unavailable";
  matchingVersions: MatchingVersion[];
  recommendation: "reuse_existing" | "prepare_new_draft" | "review_manually";
  explanation: string;
  semanticAssessment: "unavailable";
};
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "profile_required"; confirmed: boolean; missing: string[] }
  | { status: "master_cv_ready"; profileVersion: number; masterCv: MasterCv | null; isStale?: boolean };

type JobForm = { title: string; company: string; location: string; sourceUrl: string; description: string };
const emptyJobForm: JobForm = { title: "", company: "", location: "", sourceUrl: "", description: "" };

export function CvStudioStart() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [reusableCv, setReusableCv] = useState<ReusableCv | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [jobInputTab, setJobInputTab] = useState<"discovery" | "paste">("discovery");

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/cv-studio", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "CV Studio could not load.");
      setState(body as State);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "CV Studio could not load." });
    }
  }, []);

  useEffect(() => {
    const selectedJobId = new URLSearchParams(window.location.search).get("jobId");
    setJobId(selectedJobId);
    void load();
  }, [load]);

  const assessContext = useCallback(async (context: JobContext, masterVersionId: string) => {
    const response = await fetch("/api/cv-studio/suitability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterVersionId, jobContext: context }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "The CV recommendation could not be loaded.");
    setSuitability(body as Suitability);
  }, []);

  const resolveDiscoveryJob = useCallback(async (selectedJobId: string, masterVersionId: string) => {
    setWorkflowBusy(true);
    setWorkflowError(null);
    setSuitability(null);
    try {
      const response = await fetch("/api/cv-studio/job-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "discovery", jobId: selectedJobId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The selected job could not be loaded.");
      const context = body.jobContext as JobContext;
      setJobContext(context);
      await assessContext(context, masterVersionId);
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : "The selected job could not be loaded.");
    } finally {
      setWorkflowBusy(false);
    }
  }, [assessContext]);

  useEffect(() => {
    if (state.status !== "master_cv_ready" || !state.masterCv || !jobId || jobContext) return;
    void resolveDiscoveryJob(jobId, state.masterCv.id);
  }, [state, jobId, jobContext, resolveDiscoveryJob]);


  async function useAcceptedCv(versionId: string) {
    if (!jobContext) return;
    setWorkflowBusy(true);
    setWorkflowError(null);
    try {
      const response = await fetch("/api/cv-studio/reuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, jobContext }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The saved CV could not be reused.");
      setReusableCv(body.version as ReusableCv);
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : "The saved CV could not be reused.");
    } finally {
      setWorkflowBusy(false);
    }
  }

  async function submitPastedJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "master_cv_ready" || !state.masterCv) return;
    setWorkflowBusy(true);
    setWorkflowError(null);
    setSuitability(null);
    try {
      const response = await fetch("/api/cv-studio/job-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "pasted",
          title: jobForm.title,
          company: jobForm.company || null,
          location: jobForm.location || null,
          sourceUrl: jobForm.sourceUrl || null,
          description: jobForm.description,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The job description could not be validated.");
      const context = body.jobContext as JobContext;
      setJobContext(context);
      await assessContext(context, state.masterCv.id);
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : "The job description could not be validated.");
    } finally {
      setWorkflowBusy(false);
    }
  }

  function clearSelectedJob() {
    setJobId(null);
    setJobContext(null);
    setSuitability(null);
    setReusableCv(null);
    setWorkflowError(null);
    setJobForm(emptyJobForm);
    router.replace("/cv-studio");
  }

  return (
    <main className="th-cv-studio-page mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {state.status === "loading" && <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-live="polite">Checking your Profile and CV versions…</section>}

      {state.status === "error" && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6" role="alert">
          <h2 className="font-semibold text-rose-900">CV Studio could not load</h2>
          <p className="mt-2 text-sm text-rose-800">{state.message}</p>
          <Button className="mt-4" variant="outline" onClick={() => void load()}>Try again</Button>
        </section>
      )}

      {state.status === "profile_required" && (
        <section className="grid gap-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-amber-950">{state.confirmed ? "Your Profile needs more information" : "Complete and confirm your Profile first"}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">CV Studio uses confirmed Profile information as its only source of candidate facts. Complete the missing information and confirm your Profile before generating a CV.</p>
            {state.missing.length > 0 && <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-amber-950">{state.missing.map((item) => <li key={item}>{item}</li>)}</ul>}
          </div>
          <ButtonLink href="/profile">Complete Profile</ButtonLink>
        </section>
      )}

      {state.status === "master_cv_ready" && (
        <div className="space-y-6">
          {jobContext && state.masterCv ? (
            <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
              <section className="space-y-5 text-fg">
                <div className="rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Job from Discovery</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-950">{jobContext.title}</h2>
                      <p className="mt-1 text-sm text-fg-muted">{[jobContext.company, jobContext.location].filter(Boolean).join(" · ") || "Company/location not supplied"}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearSelectedJob}>Remove job</Button>
                  </div>
                  <div className="mt-5 border-t border-line pt-4">
                    <h3 className="text-sm font-semibold text-fg">Job description</h3>
                    <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-line pr-2 text-sm leading-6 text-fg-muted">{formatJobDescription(jobContext.description)}</div>
                  </div>
                  {jobContext.sourceUrl && <a className="mt-4 inline-flex text-sm font-medium text-accent-text underline underline-offset-4" href={jobContext.sourceUrl} target="_blank" rel="noreferrer">Open original job advert</a>}
                </div>
                <div className="rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-6" aria-live="polite">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">CV assessment</p>
                  {workflowBusy && <p className="mt-2 text-sm text-fg-muted">Checking this job against your saved CV versions…</p>}
                  {workflowError && <p className="mt-2 text-sm text-rose-700" role="alert">{workflowError}</p>}
                  {suitability && <>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{suitability.matchingVersions.length ? "An accepted CV exists for this exact job" : "No accepted CV exists for this exact job"}</h3>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">{suitability.explanation}</p>
                    {suitability.matchingVersions.map((version) => <div key={version.id} className="mt-3 rounded-lg border border-line bg-panel-2 p-3"><p className="text-sm font-medium text-fg">Accepted CV · Version {version.versionNumber}</p><p className="mt-1 text-xs text-fg-muted">Updated {new Date(version.updatedAt).toLocaleDateString()}</p><Button className="mt-3 w-full" size="sm" disabled={workflowBusy} onClick={() => void useAcceptedCv(version.id)}>Use this CV</Button></div>)}
                  </>}
                  <div className="mt-4 rounded-lg border border-warn/30 bg-warn-bg p-4">
                    <p className="text-sm font-medium text-warn">AI suitability and tailoring are not active yet.</p>
                    <p className="mt-1 text-sm leading-6 text-warn">This stage checks exact job matches only. It does not assess your skills against job requirements or generate tailored content yet.</p>
                  </div>
                  <ButtonLink className="mt-4 w-full" href="/jobs">Back to Job Discovery</ButtonLink>
                </div>
              </section>
              <section className="min-w-0 rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-4">
                {reusableCv ? <div className="space-y-2"><p className="text-sm font-medium text-fg">Reusing accepted CV · Version {reusableCv.version_number}</p><Button variant="outline" size="sm" onClick={() => setReusableCv(null)}>Return to master CV</Button><CvPdfPreview content={reusableCv.content} accent={reusableCv.accent_colour} /></div> : <CvPdfPreview content={state.masterCv.content} />}
              </section>
            </div>
            {!reusableCv && <CvDraftEditor masterVersionId={state.masterCv.id} jobContext={jobContext} initialContent={state.masterCv.content} />}
          ) : (
          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
            <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">Choose a job source</p>
                <h2 className="mt-1 text-xl font-semibold text-fg">What opportunity are you applying for?</h2>
                <p className="mt-2 text-sm leading-6 text-fg-muted">Start with a job from Thungatha Discovery, or add an opportunity you found elsewhere.</p>
              </div>
              <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3" role="tablist" aria-label="Job source">
                <Button type="button" role="tab" aria-selected={jobInputTab === "discovery"} variant={jobInputTab === "discovery" ? "secondary" : "ghost"} onClick={() => setJobInputTab("discovery")}>Thungatha Discovery</Button>
                <Button type="button" role="tab" aria-selected={jobInputTab === "paste"} variant={jobInputTab === "paste" ? "secondary" : "ghost"} onClick={() => setJobInputTab("paste")}>Add external job</Button>
              </div>
              {jobInputTab === "discovery" ? (
                <div role="tabpanel" className="rounded-xl border border-line bg-panel-2 p-5">
                  <h3 className="text-base font-semibold text-fg">Find a job in Thungatha</h3>
                  <p className="mt-2 text-sm leading-6 text-fg-muted">Browse jobs in Discovery. When you choose “Tailor my CV” on a job, Thungatha will bring its details here and check whether an accepted CV already exists for that exact opportunity.</p>
                  <ButtonLink className="mt-5 w-full sm:w-auto" href="/jobs">Browse job discovery</ButtonLink>
                </div>
              ) : (
                <div role="tabpanel">
                  <h3 className="mb-4 text-base font-semibold text-fg">Add a job from another source</h3>
                  <form className="space-y-4" onSubmit={submitPastedJob}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Job title" required><Input required minLength={2} maxLength={300} value={jobForm.title} onChange={(event) => setJobForm((value) => ({ ...value, title: event.target.value }))} placeholder="e.g. Software Developer" /></Field>
                      <Field label="Company"><Input maxLength={300} value={jobForm.company} onChange={(event) => setJobForm((value) => ({ ...value, company: event.target.value }))} placeholder="Company name" /></Field>
                      <Field label="Location"><Input maxLength={300} value={jobForm.location} onChange={(event) => setJobForm((value) => ({ ...value, location: event.target.value }))} placeholder="e.g. Cape Town / Remote" /></Field>
                      <Field label="Job advert URL (optional)"><Input type="url" maxLength={2000} value={jobForm.sourceUrl} onChange={(event) => setJobForm((value) => ({ ...value, sourceUrl: event.target.value }))} placeholder="https://" /></Field>
                    </div>
                    <Field label="Full job description" required hint="Paste at least 200 characters. You can add the advert URL for reference; the description is required.">
                      <Textarea required minLength={200} maxLength={30000} rows={9} value={jobForm.description} onChange={(event) => setJobForm((value) => ({ ...value, description: event.target.value }))} placeholder="Paste the responsibilities, requirements and qualifications from the job advert…" />
                    </Field>
                    {workflowError && <p className="text-sm text-rose-700" role="alert">{workflowError}</p>}
                    <Button type="submit" disabled={workflowBusy || !state.masterCv}>{workflowBusy ? "Checking job…" : "Use this job description"}</Button>
                  </form>
                </div>
              )}
              <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-fg-muted">Your master CV is generated only from your confirmed Profile. Adding a job never changes your Profile or master CV.</p>
            </section>
            <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
              {state.masterCv ? (
                <>
                  <CvPdfPreview content={state.masterCv.content} />
                </>
              ) : (
                <p className="text-sm text-fg-muted">Your master CV is being prepared.</p>
              )}
            </section>
          </div>
          )}

        </div>
      )}
    </main>
  );
}

function formatJobDescription(value: string) {
  return value
    .replace(/<\/(p|div|li|h[1-6]|br)\s*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="block text-sm font-medium text-slate-800">{label}{required ? " *" : ""}</span>{children}{hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}</label>;
}

