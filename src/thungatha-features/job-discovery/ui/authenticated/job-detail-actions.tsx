"use client";


import { Bookmark, Check, EyeOff, ExternalLink, PanelsTopLeft } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

type JobState = "saved" | "dismissed" | null;
type Job = { id: string; title: string; state: JobState };
export function JobDetailActions({ job, applicationDestination, applicationUrl, jobSourceUrl, busy, detailLoading, onApply, onSave, onDismiss }: {
  job: Job; applicationDestination: string | null; applicationUrl: string | null;
  jobSourceUrl: string | null; busy: boolean; detailLoading: boolean;
  onApply: () => void; onSave: () => void; onDismiss: () => void;
}) {
  return <div className="th-jobs-detail-actions th-jobs-redesign-actions">
    <Button variant="primary" disabled={!applicationDestination || busy || detailLoading}
      title={applicationUrl ? "Opens the supplied application destination" : jobSourceUrl ? "Opens the available source listing; it may not be the employer application page" : "No job or application link is available"}
      onClick={onApply}><ExternalLink size={14}/>{applicationUrl ? "Apply on company site" : "Open job listing"}</Button>
    <ButtonLink className="th-jobs-tailor-link" variant="secondary" href={`/cv-studio?jobId=${encodeURIComponent(job.id)}`}><PanelsTopLeft size={14}/> Tailor my CV</ButtonLink>
    <Button variant="secondary" disabled={busy || detailLoading} onClick={onSave}>
      {job.state === "saved" ? <><Check size={14}/> Saved</> : <><Bookmark size={14}/> Save</>}
    </Button>
    <Button variant="secondary" disabled={busy || detailLoading} onClick={onDismiss}>
      {job.state === "dismissed" ? "Restore" : <><EyeOff size={14}/> Dismiss</>}
    </Button>
  </div>;
}
