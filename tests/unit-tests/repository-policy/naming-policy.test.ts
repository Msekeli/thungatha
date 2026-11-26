import { describe, expect, it } from "vitest";
import { validateNewPath } from "../../../scripts/repository-policy.mjs";

describe("repository naming policy", () => {
  it("allows framework files, technical folders, and config files", () => {
    expect(validateNewPath("page.tsx")).toEqual([]);
    expect(validateNewPath("route.ts")).toEqual([]);
    expect(validateNewPath("unit-tests", "directory")).toEqual([]);
    expect(validateNewPath("(job-discovery)", "directory")).toEqual([]);
    expect(validateNewPath("[id]", "directory")).toEqual([]);
    expect(validateNewPath(".css-approvals.json")).toEqual([]);
  });

  it("requires lowercase kebab-case names of at most three words", () => {
    expect(validateNewPath("job-card.tsx")).toEqual([]);
    expect(validateNewPath("cv-draft-review.tsx")).toEqual([]);
    expect(validateNewPath("homepage.tsx")).toContain(
      "one-word names require an established framework or technical convention",
    );
    expect(validateNewPath("Job-Card.tsx")).toContain(
      "use lowercase kebab-case",
    );
    expect(validateNewPath("one-two-three-four.ts")).toContain(
      "use no more than three words",
    );
  });

  it("recognizes test suffixes without counting them as name words", () => {
    expect(validateNewPath("repository-policy.test.ts")).toEqual([]);
    expect(validateNewPath("repository-policy.spec.tsx")).toEqual([]);
  });
});
