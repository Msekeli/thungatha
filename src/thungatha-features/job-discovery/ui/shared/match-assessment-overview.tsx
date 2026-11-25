import type { MatchAssessment } from "./match-assessment-types";

export function MatchAssessmentOverview({ assessment }: { assessment: MatchAssessment }) {
  return (
    <>
      <div>
        <span className="text-xs text-fg-muted">Classification</span>
        <h3 className="mt-1 font-semibold">
          {assessment.classification === "match" ? "Match" : "Relevant"}
        </h3>
        <p className="mt-1 text-fg-muted">{assessment.summary}</p>
      </div>
      <p className="text-fg-muted">{assessment.alignmentExplanation}</p>
      {assessment.understandingCoverage !== "complete" && (
        <p className="rounded-md border border-line p-2 text-xs text-fg-muted">
          {assessment.understandingCoverage === "partial"
            ? "The job advert could only be partially analysed. Some requirements may not be represented below."
            : "The job advert could not be fully analysed. Treat this assessment as incomplete."}
        </p>
      )}
      {assessment.semanticAlignment && (
        <section className="space-y-2">
          <h4 className="font-semibold">Overall supporting evidence</h4>
          {assessment.semanticAlignment.jobEvidence?.map((item) => (
            <p key={item.id} className="rounded-md bg-panel p-2 text-fg-muted">{item.content}</p>
          ))}
          {assessment.semanticAlignment.profileEvidence?.map((item) => (
            <p key={item.id} className="rounded-md bg-panel p-2 text-fg-muted">
              <span className="font-semibold">Your Profile · {item.sourcePath}: </span>
              {item.content}
            </p>
          ))}
        </section>
      )}
    </>
  );
}
