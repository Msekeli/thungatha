"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { JobForm } from "./cv-studio-types";
import { CvStudioFormField } from "./cv-studio-form-field";
import { CvStudioExternalJobFormHeader } from "./cv-studio-external-job-form-header";

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
      <CvStudioExternalJobFormHeader onClose={onClose} />
      <form className="space-y-4" onSubmit={onSubmit}>
        <CvStudioFormField label="Job title" required>
          <Input
            required minLength={2} maxLength={300}
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
            placeholder="e.g. Software Developer"
          />
        </CvStudioFormField>
        <CvStudioFormField label="Company name" required>
          <Input
            required minLength={2} maxLength={300}
            value={value.company}
            onChange={(event) => onChange({ ...value, company: event.target.value })}
            placeholder="e.g. Example Technologies"
          />
        </CvStudioFormField>
        <CvStudioFormField
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
        </CvStudioFormField>
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
