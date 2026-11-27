"use client";

import { useState, type FormEvent } from "react";
import { ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { applicationStatuses, type ApplicationRecord } from "../types/application";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (application: Omit<ApplicationRecord, "id">) => void;
};

const initialValues: Omit<ApplicationRecord, "id"> = {
  company: "",
  jobTitle: "",
  applicationDate: "",
  source: "",
  url: "",
  status: "Draft",
  notes: "",
};

export function RecordApplicationDialog({ open, onClose, onCreate }: Props) {
  const [values, setValues] = useState(initialValues);
  const [jobDescription, setJobDescription] = useState("");

  if (!open) return null;

  function update<K extends keyof typeof initialValues>(
    key: K,
    value: (typeof initialValues)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      ...values,
      company: values.company.trim(),
      jobTitle: values.jobTitle.trim(),
      url: values.url.trim(),
      notes: [values.notes.trim(), jobDescription.trim() ? `Job description supplied in this preview: ${jobDescription.trim()}` : ""]
        .filter(Boolean)
        .join("\n\n"),
    });
    setValues(initialValues);
    setJobDescription("");
    onClose();
  }

  return (
    <Modal
      title="Record an application"
      description="Capture the role and where you are in the application process."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Company / employer <span className="text-destructive">*</span>
            <Input
              required
              autoFocus
              value={values.company}
              onChange={(event) => update("company", event.target.value)}
              placeholder="e.g. Acme Technologies"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Job title <span className="text-destructive">*</span>
            <Input
              required
              value={values.jobTitle}
              onChange={(event) => update("jobTitle", event.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Application date
            <Input
              type="date"
              value={values.applicationDate}
              onChange={(event) => update("applicationDate", event.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Where did you apply?
            <NativeSelect
              value={values.source}
              onChange={(event) => update("source", event.target.value)}
            >
              <option value="">Select a source</option>
              <option value="Company website">Company website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Recruitment agency">Recruitment agency</option>
              <option value="Thungatha">Thungatha</option>
              <option value="Other">Other</option>
            </NativeSelect>
          </label>
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
            Current status
            <NativeSelect
              value={values.status}
              onChange={(event) => update("status", event.target.value as ApplicationRecord["status"])}
            >
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </NativeSelect>
            <span className="block text-xs font-normal text-muted-foreground">
              Choose Submitted only if you have actually sent the application.
            </span>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-medium">
          Application link <span className="font-normal text-muted-foreground">(optional)</span>
          <Input
            type="url"
            value={values.url}
            onChange={(event) => update("url", event.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
          <Textarea
            rows={3}
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Add context, contact details or a reminder..."
          />
        </label>
        <details className="rounded-lg border border-border px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Add job description <span className="font-normal text-muted-foreground">(optional)</span>
          </summary>
          <div className="pt-3">
            <Textarea
              rows={5}
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job advert if you need it alongside this application."
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Full job descriptions are subject to the product's retention rules.
            </p>
          </div>
        </details>
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            This preview keeps the record in page memory only. It is not saved to an account.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              <ClipboardPlus data-icon="inline-start" />
              Add to preview
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
