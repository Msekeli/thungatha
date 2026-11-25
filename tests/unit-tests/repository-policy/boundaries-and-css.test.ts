import { describe, expect, it } from "vitest";
import {
  validateCssApproval,
  validateImportBoundaries,
} from "../../../scripts/repository-policy.mjs";

describe("feature UI ownership", () => {
  it("allows imports within the owning feature and global UI", () => {
    const source = [
      'import { Button } from "@/components/ui/button";',
      'import { Card } from "../ui/cv-card";',
    ].join(" ");
    expect(validateImportBoundaries(
      "src/thungatha-features/cv-studio/ui/cv-editor.tsx",
      source,
    )).toEqual([]);
  });

  it("blocks one feature importing another feature's private UI", () => {
    const source =
      'import { JobCard } from "@/thungatha-features/job-discovery/ui/shared/job-card";';
    expect(validateImportBoundaries(
      "src/thungatha-features/cv-studio/ui/cv-editor.tsx",
      source,
    )).toHaveLength(1);
  });

  it("blocks global components importing feature-private UI", () => {
    const source =
      'import { SignOutControl } from "@/thungatha-features/authentication/ui/sign-out-control";';
    expect(validateImportBoundaries(
      "src/components/layout/workspace-shell.tsx",
      source,
    )).toHaveLength(1);
  });

  it("does not block route composition or test imports", () => {
    const source =
      'import { Card } from "@/thungatha-features/job-discovery/ui/card";';
    expect(validateImportBoundaries("src/app/page.tsx", source)).toEqual([]);
    expect(validateImportBoundaries(
      "tests/unit-tests/example.test.ts",
      source,
    )).toEqual([]);
  });
});

describe("CSS approval policy", () => {
  const approved = {
    approvals: [{
      path: "src/components/example.css",
      reason: "Required for a complex component interaction.",
      tailwindAlternative: "Tailwind cannot express the required selector state.",
      sharedComponentAlternative: "No shared component exposes this interaction.",
      approvedBy: "user",
      approvedAt: "2026-11-26",
    }],
  };

  it("requires an explicit approval record for changed stylesheets", () => {
    expect(validateCssApproval(
      "src/components/example.css",
      { approvals: [] },
    )).toHaveLength(1);
    expect(validateCssApproval(
      "src/components/example.css",
      approved,
    )).toEqual([]);
  });

  it("exempts generated token CSS", () => {
    expect(validateCssApproval(
      "src/styles/tokens.css",
      { approvals: [] },
    )).toEqual([]);
  });
});
