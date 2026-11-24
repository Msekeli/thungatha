import { describe, expect, it } from "vitest";
import { sourceSegments } from "@/thungatha-features/job-discovery/server/job-requirement-text";
import { buildJobEvidence } from "@/thungatha-features/job-discovery/server/job-ai-evidence";

describe("job source evidence text", () => {
  it("preserves word boundaries in plain-text descriptions", () => {
    expect(sourceSegments("Build web applications using React and TypeScript.")).toEqual([
      "Build web applications using React and TypeScript.",
    ]);
  });

  it("preserves word boundaries across inline HTML elements", () => {
    expect(sourceSegments("<p>Build web applications using <strong>React</strong> and TypeScript.</p>")).toEqual([
      "Build web applications using React and TypeScript.",
    ]);
  });

  it("keeps evidence excerpts lossless through the job evidence builder", () => {
    const evidence = buildJobEvidence("<p>Build with React and TypeScript.</p>");
    expect(evidence[0].content).toBe("Build with React and TypeScript.");
  });
});
