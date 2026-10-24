"use client";
import type { RefObject } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ProfileCvDropzone({ inputRef, file, busy, error, dragging, onDragging, onSelectFile, onUpload, onCancel }: {
  inputRef: RefObject<HTMLInputElement | null>; file: File | null; busy: boolean; error: string; dragging: boolean;
  onDragging: (value: boolean) => void; onSelectFile: (file: File | null) => void; onUpload: () => void; onCancel: () => void;
}) {
  return <>
    <div onDragOver={(event) => { event.preventDefault(); onDragging(true); }} onDragLeave={() => onDragging(false)} onDrop={(event) => { event.preventDefault(); onDragging(false); onSelectFile(event.dataTransfer.files[0] || null); }} className={`mt-5 rounded-lg border border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-accent/40" : "border-border"}`}>
      <Upload className="mx-auto size-5 text-muted-foreground" /><p className="mt-2 text-sm font-medium">Drag your CV here or choose a file</p><p className="mt-1 text-xs text-muted-foreground">PDF and DOCX files only</p>
      <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>Choose file</Button>
      <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={(event) => onSelectFile(event.target.files?.[0] || null)} />
    </div>
    {file && <div className="mt-3 flex items-center gap-3 rounded-lg border border-border p-3"><FileText className="size-5 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div><Button type="button" variant="ghost" size="icon" aria-label="Remove selected file" onClick={onCancel}><X className="size-4" /></Button></div>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button type="button" disabled={!file || busy} onClick={onUpload}>{busy ? "Uploading…" : "Import CV"}</Button>{file && <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button>}</div>
  </>;
}
