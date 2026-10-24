"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCvExtraction } from "@/thungatha-features/user-profile/ui/profile-cv-extraction";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
type UploadedCv = { filename: string; fileSize: number; uploadedAt: string; storagePath: string; status: "staged" };

export function ProfileCvUpload({ hasCurrentCv = false }: { hasCurrentCv?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedCv | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function selectFile(next: File | null) {
    setError(""); setUploaded(null);
    if (!next) { setFile(null); return; }
    if (!/\.pdf$/i.test(next.name) && !/\.docx$/i.test(next.name)) {
      setFile(null); setError("Choose a PDF or DOCX file."); return;
    }
    if (next.size === 0) { setFile(null); setError("This file is empty."); return; }
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

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-panel-2 text-accent"><FileText size={19} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-fg">{hasCurrentCv ? "Upload a replacement CV" : "Start from your CV"}</h2>
          <p className="mt-1 text-sm text-fg-muted">PDF or DOCX · Maximum 5 MB. Your file is stored privately.</p>
        </div>
      </div>
      {uploaded ? (
        <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3">
          <p role="status" className="text-sm font-medium text-fg">CV uploaded: {uploaded.filename}</p>
          <p className="mt-1 text-xs text-fg-muted">It is staged for import. {hasCurrentCv ? "Your current CV has not been changed." : "It has not been set as your master CV yet."} Extraction results are proposals. Review and confirmation will be handled separately.</p>
          <ProfileCvExtraction filename={uploaded.filename} storagePath={uploaded.storagePath} />
          <Button className="mt-3" variant="secondary" onClick={() => { setUploaded(null); inputRef.current?.click(); }}>Choose another file</Button>
        </div>
      ) : (
        <>
          <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0] || null); }}
            className={`mt-4 rounded-xl border border-dashed p-5 text-center transition-colors ${dragging ? "border-accent bg-accent/10" : "border-line"}`}>
            <Upload className="mx-auto size-5 text-fg-muted" />
            <p className="mt-2 text-sm text-fg">Drag your CV here or choose a file</p>
            <Button type="button" variant="secondary" className="mt-3" onClick={() => inputRef.current?.click()}>Choose file</Button>
            <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(event) => selectFile(event.target.files?.[0] || null)} />
          </div>
          {file && <div className="mt-3 flex items-center gap-3 rounded-lg border border-line p-3"><FileText size={18} className="shrink-0 text-accent" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{file.name}</p><p className="text-xs text-fg-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div><Button type="button" variant="ghost" size="icon" aria-label="Remove selected file" onClick={() => selectFile(null)}><X size={16} /></Button></div>}
          {error && <p role="alert" className="mt-3 text-sm text-warn">{error}</p>}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" disabled={!file || busy} onClick={() => void upload()}>{busy ? "Uploading…" : "Import CV"}</Button>
            {file && <Button type="button" variant="ghost" disabled={busy} onClick={() => selectFile(null)}>Cancel</Button>}
          </div>
        </>
      )}
    </section>
  );
}
