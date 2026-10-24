"use client";

export function ProfileSummaryForm({
  summary,
  onChange,
}: {
  summary: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <h2 className="text-sm font-semibold text-fg">Professional Summary</h2>
      <p className="mt-1 text-xs text-fg-muted">
        Short profile or about statement highlighting your experience.
      </p>
      <textarea
        rows={3}
        value={summary || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-lg border border-line bg-panel-2 p-3 text-xs text-fg placeholder:text-fg-muted/50 outline-none focus:border-accent"
        placeholder="e.g. Software engineer with 4 years of experience building web applications..."
      />
    </div>
  );
}
