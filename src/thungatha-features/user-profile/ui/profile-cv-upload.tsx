"use client";
import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import type { ExtractedCvFields } from "./profile-cv-extraction";
import { ProfileCvDropzone } from "./profile-cv-dropzone";
import { ProfileCvStagedUpload, type UploadedCv } from "./profile-cv-staged-upload";
const MAX_SIZE = 5 * 1024 * 1024;
export function ProfileCvUpload({ hasCurrentCv = false, onExtracted }: {
  hasCurrentCv?: boolean; onExtracted?: (fields: ExtractedCvFields) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedCv | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  function selectFile(next: File | null) {
    setError(""); setUploaded(null);
    if (!next) { setFile(null); return; }
    if (!/\.pdf$/i.test(next.name) && !/\.docx$/i.test(next.name)) { setFile(null); setError("Choose a PDF or DOCX file."); return; }
    if (!next.size) { setFile(null); setError("This file is empty."); return; }
    if (next.size > MAX_SIZE) { setFile(null); setError("CV files must be 5 MB or smaller."); return; }
    setFile(next);
  }
  async function upload() {
    if (!file || busy) return;
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/profile/cv-upload", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Upload failed. Please try again.");
      setUploaded(body.upload as UploadedCv); setFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed. Please try again.");
    } finally { setBusy(false); }
  }
  return <section className="rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-6">
    <div className="flex items-start gap-2 sm:gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:size-10"><FileText className="size-4 sm:size-5" /></span><div><h2 className="text-sm font-semibold sm:text-base">{hasCurrentCv ? "Upload a replacement CV" : "Start from your CV"}</h2><p className="mt-1 text-xs leading-4 text-muted-foreground sm:text-sm sm:leading-normal">PDF or DOCX · Maximum 5 MB. Your file is stored privately.</p></div></div>
    {uploaded ? <ProfileCvStagedUpload uploaded={uploaded} hasCurrentCv={hasCurrentCv} onExtracted={onExtracted} onChooseAnother={() => { setUploaded(null); inputRef.current?.click(); }} /> : <ProfileCvDropzone inputRef={inputRef} file={file} busy={busy} error={error} dragging={dragging} onDragging={setDragging} onSelectFile={selectFile} onUpload={() => void upload()} onCancel={() => selectFile(null)} />}
  </section>;
}
