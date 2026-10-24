"use client";
import { Textarea } from "@/components/ui/textarea";
export function ProfileSummaryForm({ summary, onChange }: { summary: string | null; onChange: (value: string) => void }) {
  const length = (summary || "").length;
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <div className="space-y-1"><h2 className="text-base font-semibold">Professional summary</h2><p className="text-sm text-muted-foreground">Introduce your experience, strengths and the work you do.</p></div>
    <Textarea rows={5} maxLength={5000} value={summary || ""} onChange={(event) => onChange(event.target.value)} className="mt-4 min-h-32 resize-y" placeholder="Write a short professional introduction…" aria-label="Professional summary" />
    <p className="mt-2 text-right text-xs text-muted-foreground">{length.toLocaleString()}/5,000 characters</p>
  </section>;
}
