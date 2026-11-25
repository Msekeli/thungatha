"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { JobForm } from "./cv-studio-types";

type CvStudioExternalJobFormProps = {
  value: JobForm;
  busy: boolean;
  error: string | null;
  hasMasterCv: boolean;
  onChange: (value: JobForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onReset: () => void;
};

export function CvStudioExternalJobForm({
  value, busy, error, hasMasterCv, onChange, onSubmit, onClose, onReset,
}: CvStudioExternalJobFormProps) {
  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
            External opportunity
          </p>
          <h2 className="mt-1 text-xl font-semibold text-fg">Add job details</h2>
          <p className="mt-2 text-sm leading-6 text-fg-muted">
            Enter the job title and company, then paste the full job description.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Job title" required>
          <Input
            required minLength={2} maxLength={300}
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
            placeholder="e.g. Software Developer"
          />
        </Field>
        <Field label="Company name" required>
          <Input
            required minLength={2} maxLength={300}
            value={value.company}
            onChange={(event) => onChange({ ...value, company: event.target.value })}
            placeholder="e.g. Example Technologies"
          />
        </Field>
        <Field
          label="Job description"
          required
          hint="Paste the job advert text. A minimum of 200 characters is required."
        >
          <Textarea
            required minLength={200} maxLength={30000} rows={12}
            value={value.description}
            onChange={(event) => onChange({ ...value, description: event.target.value })}
            placeholder="Paste the complete job description here…"
          />
        </Field>
        {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy || !hasMasterCv}>
            {busy ? "Adding job…" : "Continue with this job"}
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-slate-800">
        {label}{required ? " *" : ""}
      </span>
      {children}
      {hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}
    </label>
  );
}
