import { CvDraftRequirementsSection } from "./cv-draft-requirements-section";
import type { CvDraft } from "./cv-draft-types";

export function CvDraftRequirementsReview({
  assessment,
}: {
  assessment: CvDraft["tailoring_assessment"];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0">
        <h3 className="text-lg font-bold">Job Requirements</h3>
        <p className="text-sm text-fg-muted">
          Requirements from the job that your confirmed Profile does not currently demonstrate.
          This assessment is informational and does not change your CV.
        </p>
      </div>
      <CvDraftRequirementsSection assessment={assessment} />
    </div>
  );
}
