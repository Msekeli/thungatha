"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

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
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "profile_required"; confirmed: boolean; missing: string[] }
  | { status: "master_cv_ready"; profileVersion: number; masterCv: MasterCv | null; isStale?: boolean };

export function CvStudioStart() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [busy, setBusy] = useState(false);

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

  useEffect(() => { void load(); }, [load]);

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
      setState({
        status: "master_cv_ready",
        profileVersion: body.masterCv.source_profile_version,
        masterCv: body.masterCv,
      });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "The master CV could not be generated." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Thungatha / CV Studio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">Your master CV</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Your master CV is generated from your confirmed Profile. It is the source document for job-specific versions.
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
            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
              CV Studio uses confirmed Profile information as its only source of candidate facts. Complete the missing information and confirm your Profile before generating a CV.
            </p>
            {state.missing.length > 0 && <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-amber-950">{state.missing.map((item) => <li key={item}>{item}</li>)}</ul>}
          </div>
          <ButtonLink href="/profile">Complete Profile</ButtonLink>
        </section>
      )}

      {state.status === "master_cv_ready" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {state.masterCv ? (
              <MasterCvPreview content={state.masterCv.content} />
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
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose a job from Discovery to assess your master CV and prepare a tailored version.</p>
            <ButtonLink className="mt-4 w-full" href="/jobs">Browse jobs</ButtonLink>
            <p className="mt-4 text-xs leading-5 text-slate-500">Tailoring will never overwrite your master CV or confirmed Profile.</p>
          </aside>
        </div>
      )}
    </main>
  );
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
