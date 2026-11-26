import { describe, expect, it } from "vitest";
import { validateCssApproval } from "../../../scripts/repository-policy.mjs";

describe("CSS approval policy", () => {
  const approved = {
    approvals: [
      {
        path: "src/components/example.css",
        reason: "Required for a complex component interaction.",
        tailwindAlternative:
          "Tailwind cannot express the required selector state.",
        sharedComponentAlternative:
          "No shared component exposes this interaction.",
        approvedBy: "user",
        approvedAt: "2026-11-26",
      },
    ],
  };

  it("requires an explicit approval record for changed stylesheets", () => {
    expect(
      validateCssApproval("src/components/example.css", { approvals: [] }),
    ).toHaveLength(1);
    expect(validateCssApproval("src/components/example.css", approved)).toEqual(
      [],
    );
  });

  it("exempts generated token CSS", () => {
    expect(
      validateCssApproval("src/styles/tokens.css", { approvals: [] }),
    ).toEqual([]);
  });
});
