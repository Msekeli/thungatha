import { describe, expect, it } from "vitest";
import {
  createEvidence,
  createSchema,
  master,
} from "./cv-tailoring-test-fixtures";

describe("CV tailoring response schema", () => {
  it("converts the response contract to Gemini-compatible structured schema", () => {
    const result = createSchema();
    expect(result.responseSchema.type).toBe("OBJECT");
    const properties = result.responseSchema.properties as Record<
      string,
      unknown
    >;
    const suggestions = properties.suggestions as {
      items: {
        properties: Record<string, { nullable?: boolean; type?: string }>;
      };
    };
    expect(suggestions.items.properties.originalText.nullable).toBe(true);
    expect(suggestions.items.properties.targetPath.type).toBe("STRING");
    expect(suggestions.items.properties.requirementIds.type).toBe("ARRAY");
  });

  it("rejects model references outside supplied evidence and editable paths", () => {
    const schema = createSchema();
    expect(() =>
      schema.validator.parse({
        suggestions: [
          {
            targetPath: "email",
            originalText: "candidate@example.com",
            proposedText: "new@example.com",
            reason: "Improve contact details.",
            profileEvidenceRefs: ["cv:headline"],
            requirementIds: ["req-react"],
            jobEvidenceRefs: ["job:description:0"],
          },
        ],
        coveredRequirementIds: [],
        gaps: [],
      }),
    ).toThrow();
  });

  it("allows an empty requirement set only when no suggestions or gaps are returned", () => {
    const schema = createSchema(createEvidence(), []);
    expect(
      schema.validator.parse({
        suggestions: [],
        coveredRequirementIds: [],
        gaps: [],
      }),
    ).toMatchObject({ suggestions: [], coveredRequirementIds: [], gaps: [] });

    expect(() =>
      schema.validator.parse({
        suggestions: [
          {
            targetPath: "professionalSummary",
            originalText: master.professionalSummary,
            proposedText: "A different summary.",
            reason: "A reason.",
            profileEvidenceRefs: ["cv:professionalSummary"],
            requirementIds: [],
            jobEvidenceRefs: ["job:description:0"],
          },
        ],
        coveredRequirementIds: [],
        gaps: [],
      }),
    ).toThrow(/without an extracted job requirement/);
  });
});
