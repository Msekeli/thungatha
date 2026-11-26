import type { MatchAssessment } from "./match-assessment-types";

export function MatchAssessmentRequirements({ assessment }: { assessment: MatchAssessment }) {
  return (
    <>
      {assessment.requirements.length > 0 && (
        <section>
          <h4 className="mb-2 font-semibold">Requirement evidence</h4>
          <ul className="space-y-3">
            {assessment.requirements.map((item, index) => (
              <li key={item.requirement + index} className="border-t border-line pt-2">
                <p className="font-medium">{item.requirement}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {item.importance} requirement · {item.assessment.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-fg-muted">{item.explanation}</p>
                {(item.jobEvidence?.length || item.profileEvidence?.length) ? (
                  <div className="mt-2 space-y-2">
                    {item.jobEvidence?.map((evidence) => (
                      <div key={evidence.id} className="rounded-md bg-panel p-2">
                        <span className="text-xs font-semibold text-fg-muted">Job description</span>
                        <p className="mt-1 text-fg-muted">{evidence.content}</p>
                      </div>
                    ))}
                    {item.profileEvidence?.map((evidence) => (
                      <div key={evidence.id} className="rounded-md bg-panel p-2">
                        <span className="text-xs font-semibold text-fg-muted">Your Profile · {evidence.sourcePath}</span>
                        <p className="mt-1 text-fg-muted">{evidence.content}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}
      {assessment.gaps.length > 0 && (
        <section>
          <h4 className="mb-2 font-semibold">Gaps and unknowns</h4>
          <ul className="list-disc space-y-1 pl-5 text-fg-muted">
            {assessment.gaps.map((gap, index) => (
              <li key={gap.description + index} className="space-y-1">
                <p>{gap.description}</p>
                {gap.jobEvidence?.map((item) => <p key={item.id} className="text-xs">Job: {item.content}</p>)}
                {gap.profileEvidence?.map((item) => <p key={item.id} className="text-xs">Profile: {item.content}</p>)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="border-t border-line pt-3 text-xs text-fg-muted">
        This is an evidence-based guidance tool, not a hiring prediction or guarantee.
      </p>
    </>
  );
}
