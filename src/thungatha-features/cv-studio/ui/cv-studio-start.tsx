"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
const cvAccentHex = { teal: "#0F766E", navy: "#1D4ED8", burgundy: "#9F1239", forest: "#166534" } as const;
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

type JobForm = { title: string; company: string; description: string };
const emptyJobForm: JobForm = { title: "", company: "", description: "" };

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
  const [externalJobOpen, setExternalJobOpen] = useState(false);
  const [tailoringStarted, setTailoringStarted] = useState(false);

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
          company: jobForm.company,
          description: jobForm.description,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The job description could not be validated.");
      const context = body.jobContext as JobContext;
      setJobContext(context);
      setExternalJobOpen(false);
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
    setExternalJobOpen(false);
    router.replace("/cv-studio");
  }

  return (
    <main className="th-cv-studio-page mx-auto w-full max-w-[1600px]">
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
        <div className="flex min-h-0 flex-1 flex-col">
          {jobContext && state.masterCv ? (
            <>
              <div className="grid min-w-0 items-start gap-6 lg:h-full lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)]">
                <section className="min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2">
                  <div className="rounded-2xl border border-line bg-panel p-4 text-fg shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{jobContext.source === "discovery" ? "Job from Thungatha Discovery" : "External job opportunity"}</p>
                        <h2 className="mt-2 break-words text-xl font-semibold text-fg">{jobContext.title}</h2>
                        <p className="mt-1 text-sm text-fg-muted">{[jobContext.company, jobContext.location].filter(Boolean).join(" · ") || "Company/location not supplied"}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={clearSelectedJob}>Close job description</Button>
                    </div>
                    <div className="mt-5 border-t border-line pt-4">
                      <h3 className="text-sm font-semibold text-fg">Job description</h3>
                      <div className="mt-2 h-[45dvh] max-h-[45dvh] min-h-[200px] lg:h-[50dvh] lg:max-h-[50dvh] overflow-y-auto overscroll-contain whitespace-pre-line rounded-lg border border-line bg-panel-2 p-4 pr-3 text-sm leading-6 text-fg-muted">{formatJobDescription(jobContext.description)}</div>
                    </div>
                    <div className="mt-4 rounded-xl border border-line bg-panel-2 p-3" aria-live="polite">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">CV for this job</p>
                        {workflowBusy && <span className="text-xs text-fg-muted">Checking saved CVs…</span>}
                        {suitability?.matchingVersions.length ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">Existing CV available</span> : null}
                        {suitability && !suitability.matchingVersions.length ? <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-fg-muted">No existing CV for this exact job</span> : null}
                      </div>
                      {suitability?.matchingVersions.map((version) => <div key={version.id} className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div><p className="text-sm font-medium text-fg">Accepted CV · Version {version.versionNumber}</p><p className="text-xs text-fg-muted">Updated {new Date(version.updatedAt).toLocaleDateString()}</p></div>
                        <Button size="sm" variant="outline" disabled={workflowBusy} onClick={() => void useAcceptedCv(version.id)}>Use existing CV</Button>
                      </div>)}
                      {workflowError && <p className="mt-2 text-sm text-rose-700" role="alert">{workflowError}</p>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!reusableCv && <Button size="lg" className="w-full rounded-md sm:w-auto" disabled={workflowBusy || tailoringStarted} onClick={() => setTailoringStarted(true)}>{tailoringStarted ? "Preparing CV editor…" : "Tailor a new CV"}</Button>}
                      {reusableCv && <Button variant="outline" size="sm" onClick={() => setReusableCv(null)}>Return to master CV</Button>}
                    </div>
                  </div>
                  {tailoringStarted && !reusableCv && <CvDraftEditor masterVersionId={state.masterCv.id} jobContext={jobContext} initialContent={state.masterCv.content} startImmediately />}
                </section>
                <section className="min-w-0 rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-4 lg:h-full lg:overflow-y-auto">
                  {reusableCv ? <div className="space-y-2"><p className="text-sm font-medium text-fg">Reusing accepted CV · Version {reusableCv.version_number}</p><CvPdfPreview content={reusableCv.content} accent={cvAccentHex[reusableCv.accent_colour]} /></div> : <CvPdfPreview content={state.masterCv.content} />}
                </section>
              </div>
            </>
          ) : (
          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
            <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
              {!externalJobOpen ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">CV Studio</p>
                    <h2 className="mt-1 text-xl font-semibold text-fg">Prepare your CV for an opportunity</h2>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">Your master CV is ready. Provide the job details to prepare a CV for that opportunity.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-panel-2 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-panel p-2 text-accent-text"><span aria-hidden="true">↗</span></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-fg">Applying for an external opportunity?</h3>
                        <p className="mt-1 text-sm leading-6 text-fg-muted">Found a job on LinkedIn, a company website or elsewhere? Add its title, company and description here.</p>
                        <Button className="mt-4 w-full sm:w-auto" onClick={() => setExternalJobOpen(true)}>Add external job</Button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-line p-4">
                    <h3 className="font-semibold text-fg">Found a job on Thungatha?</h3>
                    <p className="mt-1 text-sm leading-6 text-fg-muted">Open Job Discovery, select an opportunity and choose <span className="font-medium text-fg">Tailor my CV</span>. The job will appear here automatically.</p>
                    <ButtonLink className="mt-4 w-full sm:w-auto" variant="outline" href="/jobs">Go to Job Discovery</ButtonLink>
                  </div>
                  <p className="border-t border-line pt-4 text-xs leading-5 text-fg-muted">Your master CV is built from your confirmed Profile. Adding a job never changes your Profile or master CV.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">External opportunity</p>
                      <h2 className="mt-1 text-xl font-semibold text-fg">Add job details</h2>
                      <p className="mt-2 text-sm leading-6 text-fg-muted">Enter the job title and company, then paste the full job description.</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setExternalJobOpen(false); setWorkflowError(null); }}>Cancel</Button>
                  </div>
                  <form className="space-y-4" onSubmit={submitPastedJob}>
                    <Field label="Job title" required><Input required minLength={2} maxLength={300} value={jobForm.title} onChange={(event) => setJobForm((value) => ({ ...value, title: event.target.value }))} placeholder="e.g. Software Developer" /></Field>
                    <Field label="Company name" required><Input required minLength={2} maxLength={300} value={jobForm.company} onChange={(event) => setJobForm((value) => ({ ...value, company: event.target.value }))} placeholder="e.g. Example Technologies" /></Field>
                    <Field label="Job description" required hint="Paste the job advert text. A minimum of 200 characters is required.">
                      <Textarea required minLength={200} maxLength={30000} rows={12} value={jobForm.description} onChange={(event) => setJobForm((value) => ({ ...value, description: event.target.value }))} placeholder="Paste the complete job description here…" />
                    </Field>
                    {workflowError && <p className="text-sm text-rose-700" role="alert">{workflowError}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={workflowBusy || !state.masterCv}>{workflowBusy ? "Adding job…" : "Continue with this job"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setExternalJobOpen(false); setJobForm(emptyJobForm); setWorkflowError(null); }}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}
            </section>
            <section className="min-w-0 rounded-2xl border border-line bg-panel p-3 text-fg shadow-sm sm:p-4">
              {state.masterCv ? <CvPdfPreview content={state.masterCv.content} /> : <p className="text-sm text-fg-muted">Your master CV is being prepared.</p>}
            </section>
          </div>          )}

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

