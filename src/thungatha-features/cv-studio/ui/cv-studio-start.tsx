"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
type HistoryVersion = { id: string; version_number: number; cv_kind: "master" | "tailored"; status: "current" | "draft" | "accepted" | "superseded"; source_profile_version: number; source_job_snapshot: { title?: string; company?: string | null } | null; updated_at: string; accepted_at: string | null };
type SelectedVersion = HistoryVersion & { content: CvContent; suggestions: Array<{ id: string; targetPath: string; reason: string; evidenceRefs: string[]; decision: "pending" | "accepted" | "rejected" }> };
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
  const [busy, setBusy] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [suitability, setSuitability] = useState<Suitability | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [versionHistory, setVersionHistory] = useState<HistoryVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<SelectedVersion | null>(null);
  const [selectedVersionLoading, setSelectedVersionLoading] = useState(false);

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

  const loadVersionHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch("/api/cv-studio/versions", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Version history could not be loaded.");
      setVersionHistory((body.versions ?? []) as HistoryVersion[]);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Version history could not be loaded.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openVersion = useCallback(async (id: string) => {
    setSelectedVersionLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch(`/api/cv-studio/versions/${encodeURIComponent(id)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "This CV version could not be opened.");
      setSelectedVersion(body.version as SelectedVersion);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "This CV version could not be opened.");
    } finally {
      setSelectedVersionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state.status === "master_cv_ready" && state.masterCv) void loadVersionHistory();
  }, [state, loadVersionHistory]);

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

  async function generate() {
    setBusy(true);
    try {
      const response = await fetch("/api/cv-studio", { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setState(body as State);
          return;
        }
        throw new Error(body.error ?? "The master CV could not be generated.");
      }
      const nextState: State = {
        status: "master_cv_ready",
        profileVersion: body.masterCv.source_profile_version,
        masterCv: body.masterCv,
      };
      setState(nextState);
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "The master CV could not be generated." });
    } finally {
      setBusy(false);
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
    setWorkflowError(null);
    setJobForm(emptyJobForm);
    router.replace("/cv-studio");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Thungatha / CV Studio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">Your master CV</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Your master CV is generated from your confirmed Profile. Use a job description to review the next steps for a job-specific version.
        </p>
      </header>

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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {state.masterCv ? (
                <>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Confirmed Profile · Version {state.profileVersion}</p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-950">Master CV preview</h2>
                    </div>
                    <Button variant="outline" disabled={busy} onClick={() => void generate()}>{busy ? "Refreshing…" : state.isStale ? "Refresh master CV" : "Regenerate from Profile"}</Button>
                  </div>
                  <MasterCvPreview content={state.masterCv.content} />
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Profile confirmed · Version {state.profileVersion}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">Your Profile is ready for a master CV</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">We will organise your confirmed information into the standard ATS-friendly, single-column CV. No new experience or qualifications will be added.</p>
                  {state.isStale && <p className="mt-3 text-sm text-amber-700">Your Profile has changed since the previous master CV. Generate a refreshed version.</p>}
                  <Button className="mt-6" disabled={busy} onClick={() => void generate()}>{busy ? "Generating…" : state.isStale ? "Refresh master CV" : "Generate master CV"}</Button>
                </>
              )}
            </section>
            <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-semibold text-slate-950">Next step</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Select a job from Discovery or paste its description. The current stage checks whether you have an accepted version for the exact same job; AI suitability and tailoring are not active yet.</p>
              <ButtonLink className="mt-4 w-full" href="/jobs">Browse jobs</ButtonLink>
              <p className="mt-4 text-xs leading-5 text-slate-500">Tailoring will never overwrite your master CV or confirmed Profile.</p>
            </aside>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Job context</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Choose the opportunity</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Use the selected Discovery job, or paste the job description below. The description is used as employer context, never as evidence of your experience.</p>
              </div>
              {(jobContext || jobId) && <Button variant="ghost" size="sm" onClick={clearSelectedJob}>Clear selection</Button>}
            </div>

            {jobId && !jobContext && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">Loading the job you selected in Discovery…</p>
                {workflowBusy && <p className="mt-1 text-xs text-slate-500">Retrieving the saved job description and checking existing CV versions.</p>}
              </div>
            )}

            {jobContext && (
              <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Selected job · {jobContext.source === "discovery" ? "Job Discovery" : "Pasted description"}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{jobContext.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{[jobContext.company, jobContext.location].filter(Boolean).join(" · ") || "Company/location not supplied"}</p>
                <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">{jobContext.description}</p>
              </div>
            )}

            <section className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">CV library</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Version history</h3>
                  <p className="mt-1 text-sm text-slate-600">Review saved master and tailored CV versions. Each version remains tied to its source Profile version.</p>
                </div>
                <Button variant="outline" size="sm" disabled={historyLoading} onClick={() => void loadVersionHistory()}>{historyLoading ? "Refreshing…" : "Refresh history"}</Button>
              </div>
              {historyError && <p className="mt-3 text-sm text-rose-700" role="alert">{historyError}</p>}
              {historyLoading && versionHistory.length === 0 && <p className="mt-3 text-sm text-slate-500">Loading saved versions…</p>}
              {!historyLoading && versionHistory.length === 0 && <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No saved versions were found.</p>}
              {versionHistory.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                  <div className="space-y-2">
                    {versionHistory.map((version) => (
                      <div key={version.id} className={`rounded-xl border p-3 ${selectedVersion?.id === version.id ? "border-teal-500 bg-teal-50/50" : "border-slate-200"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{version.cv_kind === "master" ? "Master CV" : "Tailored CV"} · v{version.version_number}</p>
                            <p className="mt-1 text-xs text-slate-600">{version.source_job_snapshot?.title ?? "Generated from Profile"}</p>
                            <p className="mt-1 text-xs text-slate-500">Profile v{version.source_profile_version} · {version.status} · {new Date(version.updated_at).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" variant="outline" disabled={selectedVersionLoading} onClick={() => void openVersion(version.id)}>{selectedVersion?.id === version.id ? "Viewing" : "View"}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {selectedVersionLoading && <p className="text-sm text-slate-500">Opening saved CV version…</p>}
                    {!selectedVersionLoading && !selectedVersion && <p className="text-sm leading-6 text-slate-600">Select a version to inspect its saved content.</p>}
                    {selectedVersion && (
                      <>
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                          <div><p className="font-semibold text-slate-950">{selectedVersion.cv_kind === "master" ? "Master CV" : "Tailored CV"} · v{selectedVersion.version_number}</p><p className="text-xs text-slate-500">Profile version {selectedVersion.source_profile_version}</p></div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium capitalize text-slate-700">{selectedVersion.status}</span>
                        </div>
                        {selectedVersion.source_job_snapshot && <p className="mb-4 text-sm text-slate-600">For {selectedVersion.source_job_snapshot.title}{selectedVersion.source_job_snapshot.company ? ` at ${selectedVersion.source_job_snapshot.company}` : ""}</p>}
                        <MasterCvPreview content={selectedVersion.content} />
                        {selectedVersion.cv_kind === "tailored" && (
                          <div className="mt-5 border-t border-slate-200 pt-4">
                            <h4 className="text-sm font-semibold text-slate-900">Suggestion decisions</h4>
                            {selectedVersion.suggestions.length === 0 ? <p className="mt-2 text-sm text-slate-500">No suggestion history was saved with this version.</p> : <ul className="mt-2 space-y-2">{selectedVersion.suggestions.map((suggestion) => <li key={suggestion.id} className="rounded-lg bg-white p-3 text-sm"><p className="font-medium text-slate-800">{suggestion.targetPath} · {suggestion.decision}</p><p className="mt-1 text-slate-600">{suggestion.reason}</p><p className="mt-1 text-xs text-slate-500">Evidence: {suggestion.evidenceRefs.join(", ")}</p></li>)}</ul>}
                          </div>
                        )}
                        <p className="mt-4 text-xs leading-5 text-slate-500">Historical versions are read-only here. Editing and PDF export are not active yet.</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>

            <form className="mt-6 space-y-4" onSubmit={submitPastedJob}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job title" required><Input required minLength={2} maxLength={300} value={jobForm.title} onChange={(event) => setJobForm((value) => ({ ...value, title: event.target.value }))} placeholder="e.g. Software Developer" /></Field>
                <Field label="Company"><Input maxLength={300} value={jobForm.company} onChange={(event) => setJobForm((value) => ({ ...value, company: event.target.value }))} placeholder="Company name" /></Field>
                <Field label="Location"><Input maxLength={300} value={jobForm.location} onChange={(event) => setJobForm((value) => ({ ...value, location: event.target.value }))} placeholder="e.g. Cape Town / Remote" /></Field>
                <Field label="Job advert URL (optional)"><Input type="url" maxLength={2000} value={jobForm.sourceUrl} onChange={(event) => setJobForm((value) => ({ ...value, sourceUrl: event.target.value }))} placeholder="https://" /></Field>
              </div>
              <Field label="Full job description" required hint="Paste at least 200 characters. Automatic URL importing is not enabled, so the description itself is required.">
                <Textarea required minLength={200} maxLength={30000} rows={8} value={jobForm.description} onChange={(event) => setJobForm((value) => ({ ...value, description: event.target.value }))} placeholder="Paste the responsibilities, requirements and qualifications from the job advert…" />
              </Field>
              {workflowError && <p className="text-sm text-rose-700" role="alert">{workflowError}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={workflowBusy || busy || !state.masterCv}>{workflowBusy ? "Checking job…" : "Use this job description"}</Button>
                <span className="text-xs text-slate-500">No AI-generated suitability score is shown at this stage.</span>
              </div>
            </form>

            {suitability && jobContext && (
              <div className="mt-6 border-t border-slate-200 pt-6" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Current recommendation status</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{suitability.matchingVersions.length ? "An accepted CV version exists for this exact job" : "No accepted CV version found for this exact job"}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{suitability.explanation}</p>
                {suitability.matchingVersions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {suitability.matchingVersions.map((version) => (
                      <div key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                        <div><p className="text-sm font-medium text-slate-900">Accepted tailored CV · Version {version.versionNumber}</p><p className="text-xs text-slate-500">Updated {new Date(version.updatedAt).toLocaleDateString()}</p></div>
                        <span className="text-xs text-slate-500">Saved version found</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 rounded-lg bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-950">AI suitability assessment is not available yet.</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">This check only finds an accepted CV for the exact same Discovery job or pasted description. It does not assess your skills against the job requirements. CV tailoring will be enabled after the AI stage is implemented.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="block text-sm font-medium text-slate-800">{label}{required ? " *" : ""}</span>{children}{hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}</label>;
}

function MasterCvPreview({ content }: { content: CvContent }) {
  return (
    <article className="mx-auto max-w-3xl text-slate-900">
      <header className="border-b-2 border-teal-700 pb-5">
        <h2 className="text-3xl font-bold tracking-tight">{content.fullName}</h2>
        {content.headline && <p className="mt-1 text-lg text-slate-700">{content.headline}</p>}
        <p className="mt-3 text-sm text-slate-600">{[content.email, content.phone, content.location].filter(Boolean).join(" · ")}</p>
      </header>
      <CvSection title="Professional summary"><p className="whitespace-pre-line text-sm leading-6">{content.professionalSummary}</p></CvSection>
      <CvSection title="Professional experience">
        {content.workExperience.length ? content.workExperience.map((item) => (
          <div key={item.sourceId} className="mb-4">
            <h3 className="font-semibold">{item.jobTitle} · {item.employer}</h3>
            <p className="text-xs text-slate-500">{item.startDate} – {item.isCurrent ? "Present" : item.endDate ?? "End date not supplied"}</p>
            {item.description && <p className="mt-1 whitespace-pre-line text-sm leading-5">{item.description}</p>}
            {item.achievements.length > 0 && <ul className="mt-1 list-inside list-disc text-sm">{item.achievements.map((value) => <li key={value}>{value}</li>)}</ul>}
          </div>
        )) : <p className="text-sm text-slate-500">No work experience recorded in Profile.</p>}
      </CvSection>
      <CvSection title="Personal projects">{content.projects.length ? content.projects.map((item) => <div key={item.sourceId} className="mb-3"><h3 className="font-semibold">{item.name}</h3>{item.role && <p className="text-xs text-slate-500">{item.role}</p>}{item.description && <p className="text-sm">{item.description}</p>}</div>) : <p className="text-sm text-slate-500">No projects recorded in Profile.</p>}</CvSection>
      <CvSection title="Technical skills"><p className="text-sm">{content.technicalSkills.join(" · ") || "No skills recorded in Profile."}</p></CvSection>
      <CvSection title="Education">{content.education.map((item) => <div key={item.sourceId} className="mb-3"><h3 className="font-semibold">{item.qualification}</h3><p className="text-sm">{item.institution}{item.fieldOfStudy ? " · " + item.fieldOfStudy : ""}</p></div>)}</CvSection>
      <CvSection title="Certifications">{content.certifications.length ? content.certifications.map((item) => <p key={item.sourceId} className="mb-2 text-sm">{item.name}{item.issuer ? " · " + item.issuer : ""}</p>) : <p className="text-sm text-slate-500">No certifications recorded in Profile.</p>}</CvSection>
      <CvSection title="Languages"><p className="text-sm">{content.languages.join(" · ") || "No languages recorded in Profile."}</p></CvSection>
    </article>
  );
}

function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-6 border-t border-slate-200 pt-4"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-800">{title}</h3>{children}</section>;
}
