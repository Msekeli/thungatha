"use client";

import { Textarea } from "@/components/ui/textarea";

export function ProfileSummaryForm({ summary, onChange }: {
  summary: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-sm font-semibold text-card-foreground">Professional summary</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        A concise statement highlighting your professional experience and strengths.
      </p>
      <Textarea
        rows={4}
        maxLength={5000}
        value={summary || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3"
        placeholder="Summarise your experience, strengths, and the work you do."
        aria-label="Professional summary"
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">{(summary || "").length}/5000</p>
    </section>
  );
}
