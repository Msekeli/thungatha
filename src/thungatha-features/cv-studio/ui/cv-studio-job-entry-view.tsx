"use client";

import type { FormEventHandler } from "react";
import { CvStudioWelcomePanel } from "./cv-studio-welcome-panel";
import { CvStudioExternalJobForm } from "./cv-studio-external-job-form";
import { CvStudioMasterPreview } from "./cv-studio-master-preview";
import type { CvContent } from "./cv-studio-content-types";
import type { JobForm } from "./cv-studio-types";

export function CvStudioJobEntryView({
  masterContent, jobForm, busy, error, jobId, externalJobOpen,
  onFormChange, onSubmit, onClose, onReset, onAddExternalJob,
}: {
  masterContent: CvContent | null;
  jobForm: JobForm;
  busy: boolean;
  error: string | null;
  jobId: string | null;
  externalJobOpen: boolean;
  onFormChange: (value: JobForm) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
  onReset: () => void;
  onAddExternalJob: () => void;
}) {
  return (
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
      {jobId && busy && (
        <p className="rounded-xl border border-line bg-panel p-4 text-sm text-fg-muted lg:col-span-2" role="status" aria-live="polite">
          Loading the selected job description…
        </p>
      )}
      {jobId && error && !externalJobOpen && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 lg:col-span-2" role="alert">
          {error}
        </p>
      )}
      <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 text-fg shadow-sm sm:p-7">
        {externalJobOpen ? (
          <CvStudioExternalJobForm
            value={jobForm}
            busy={busy}
            error={error}
            hasMasterCv={Boolean(masterContent)}
            onChange={onFormChange}
            onSubmit={onSubmit}
            onClose={onClose}
            onReset={onReset}
          />
        ) : (
          <CvStudioWelcomePanel onAddExternalJob={onAddExternalJob} />
        )}
      </section>
      <CvStudioMasterPreview content={masterContent} />
    </div>
  );
}
