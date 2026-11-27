import { describe, expect, it } from "vitest";
import { cvSuggestionSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import { mapCvTailoringOutput } from "@/thungatha-features/cv-studio/server/map-cv-tailoring-output";
import {
  createEvidence,
  createSchema,
  jobEvidence,
  requirements,
} from "./cv-tailoring-test-fixtures";

describe("CV tailoring output mapper", () => {
  it("rejects a valid but unrelated CV evidence reference for the edited field", () => {
    const evidence = createEvidence();
    const parsed = createSchema(evidence).validator.parse({
      suggestions: [
        {
          targetPath: "workExperience[work-1].achievements[0]",
          originalText: "Improved release workflows.",
          proposedText: "Improved release workflows for engineering teams.",
          reason: "Highlights delivery improvements.",
          profileEvidenceRefs: ["cv:workExperience[work-1].employer"],
          requirementIds: ["req-react"],
          jobEvidenceRefs: ["job:description:0"],
        },
      ],
      coveredRequirementIds: ["req-react", "req-reviews"],
      gaps: [],
    });
    expect(() =>
      mapCvTailoringOutput(
        parsed,
        evidence.profileEvidence,
        jobEvidence,
        evidence.editableTargets,
        requirements,
      ),
    ).toThrow(/exact source evidence/);
  });

  it("rejects job evidence not attached to the cited requirement", () => {
    const evidence = createEvidence();
    const parsed = createSchema(evidence).validator.parse({
      suggestions: [
        {
          targetPath: "workExperience[work-1].description",
          originalText: "Built internal web applications.",
          proposedText: "Built internal web applications with React.",
          reason: "Aligns existing frontend work to the role.",
          profileEvidenceRefs: ["cv:workExperience[work-1].description"],
          requirementIds: ["req-react"],
          jobEvidenceRefs: ["job:description:1"],
        },
      ],
      coveredRequirementIds: ["req-react", "req-reviews"],
      gaps: [],
    });
    expect(() =>
      mapCvTailoringOutput(
        parsed,
        evidence.profileEvidence,
        jobEvidence,
        evidence.editableTargets,
        requirements,
      ),
    ).toThrow(/not attached to its selected requirement/);
  });

  it("validates mapped suggestions with the persisted CV suggestion schema", () => {
    const evidence = createEvidence();
    const parsed = createSchema(evidence).validator.parse({
      suggestions: [
        {
          targetPath: "workExperience[work-1].description",
          originalText: "Built internal web applications.",
          proposedText: "  Built internal web applications using React.  ",
          reason:
            "  Connects existing application work to the stated React requirement.  ",
          profileEvidenceRefs: ["cv:workExperience[work-1].description"],
          requirementIds: ["req-react"],
          jobEvidenceRefs: ["job:description:0"],
        },
      ],
      coveredRequirementIds: ["req-react", "req-reviews"],
      gaps: [],
    });
    const mapped = mapCvTailoringOutput(
      parsed,
      evidence.profileEvidence,
      jobEvidence,
      evidence.editableTargets,
      requirements,
    );
    expect(cvSuggestionSchema.safeParse(mapped.suggestions[0]).success).toBe(
      true,
    );
    expect(mapped.suggestions[0].proposedText).toBe(
      "Built internal web applications using React.",
    );
    expect(mapped.suggestions[0].reason).toBe(
      "Connects existing application work to the stated React requirement.",
    );
  });
});
