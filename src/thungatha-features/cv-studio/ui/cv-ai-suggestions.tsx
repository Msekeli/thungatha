"use client";

import type { CvSuggestion } from "../server/cv-studio-schema";
import { Button } from "@/components/ui/button";

type Gap = {
  requirement: string;
  explanation: string;
  jobEvidenceRefs: string[];
};

export function CvAiSuggestions({
  suggestions,
  gaps,
  disabled,
  onAccept,
  onReject,
}: {
  suggestions: CvSuggestion[];
  gaps: Gap[];
  disabled: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-line p-4">
      <h4 className="font-semibold">AI tailoring suggestions</h4>
      {!suggestions.length && !gaps.length && (
        <p className="text-sm text-fg-muted">
          No suggestions have been generated yet.
        </p>
      )}
      {suggestions.map((item) => (
        <article key={item.id} className="space-y-2 rounded-lg bg-panel-2 p-3">
          <p className="text-sm font-semibold">{item.targetPath === "professionalSummary" ? "Professional summary" : item.targetPath}</p>
          <p className="text-sm text-fg-muted">{item.reason}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-line p-2">
              <p className="text-xs font-semibold text-fg-muted">Current text</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{item.originalText ?? "No existing text"}</p>
            </div>
            <div className="rounded-md border border-line p-2">
              <p className="text-xs font-semibold text-fg-muted">Proposed text</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{item.proposedText}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-fg-muted">Supporting evidence</p>
            {item.evidence.map((evidence) => (
              <div key={evidence.ref} className="rounded-md bg-panel p-2">
                <p className="text-xs font-medium text-fg-muted">
                  {evidence.source === "profile" ? "Confirmed Profile" : "Job description"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{evidence.excerpt}</p>
              </div>
            ))}
          </div>
          {item.decision === "pending" ? (
            <div className="flex gap-2">
              <Button size="sm" disabled={disabled} onClick={() => onAccept(item.id)}>
                Accept suggestion
              </Button>
              <Button size="sm" variant="outline" disabled={disabled} onClick={() => onReject(item.id)}>
                Reject
              </Button>
            </div>
          ) : (
            <p className="text-xs font-medium text-fg-muted">
              {item.decision === "accepted" ? "Accepted" : "Rejected"}
            </p>
          )}
        </article>
      ))}
      {gaps.length > 0 && (
        <div className="space-y-2 border-t border-line pt-3">
          <h5 className="text-sm font-semibold">Requirements not demonstrated</h5>
          {gaps.map((gap, index) => (
            <div key={index} className="rounded-lg bg-panel-2 p-3">
              <p className="text-sm font-medium">{gap.requirement}</p>
              <p className="mt-1 text-sm text-fg-muted">{gap.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
