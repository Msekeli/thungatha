type CvDraftRequirementsSectionProps = {
  assessment: {
    gaps: Array<{ requirement: string; explanation: string }>;
  } | null;
};

export function CvDraftRequirementsSection({
  assessment,
}: CvDraftRequirementsSectionProps) {
  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {assessment?.gaps.length ? (
        assessment.gaps.slice(0, 3).map((gap, index) => (
          <div key={index} className="rounded-xl border border-line bg-panel-2 p-3 text-fg">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded-full border border-warn bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn">
                Not demonstrated
              </span>
              <h4 className="text-sm font-semibold text-fg">{gap.requirement}</h4>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-4 text-fg-muted">{gap.explanation}</p>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-line bg-panel-2 p-4">
          <p className="text-sm font-medium">
            {assessment ? "No outstanding requirements were identified." : "The job requirements assessment is not available yet."}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {assessment
              ? "The current assessment did not identify any requirements missing from the confirmed Profile evidence."
              : "This section will display requirements that the current CV does not demonstrate once assessment data is available."}
          </p>
        </div>
      )}
      <p className="text-xs text-fg-muted">
        “Not demonstrated” means the information was not found in the confirmed Profile evidence. It does not prove that you do not have the qualification or experience.
      </p>
    </div>
  );
}
