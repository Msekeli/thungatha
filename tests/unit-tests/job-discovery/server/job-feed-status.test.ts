import { describe, expect, it } from "vitest";
import { resolveJobMatchStatus } from "@/thungatha-features/job-discovery/server/job-feed-status";

const base = {
  hasError: false,
  profileConfirmed: true,
  currentHash: "current",
};

describe("job match feed status", () => {
  it("exposes only Match and Relevant as completed classifications", () => {
    expect(
      resolveJobMatchStatus({
        ...base,
        assessment: { hash: "current", classification: "match" },
      }),
    ).toEqual({ matchStatus: "match", matchClassification: "match" });
    expect(
      resolveJobMatchStatus({
        ...base,
        assessment: { hash: "current", classification: "relevant" },
      }),
    ).toEqual({ matchStatus: "relevant", matchClassification: "relevant" });
  });

  it("represents insufficient evidence as unavailable without a classification", () => {
    expect(
      resolveJobMatchStatus({ ...base, queueStatus: "unavailable" }),
    ).toEqual({ matchStatus: "unavailable" });
  });

  it("does not reuse an assessment for a different source description", () => {
    expect(
      resolveJobMatchStatus({
        ...base,
        assessment: { hash: "old", classification: "match" },
      }),
    ).toEqual({ matchStatus: "stale" });
  });

  it("does not assign a classification when the Profile is unconfirmed", () => {
    expect(
      resolveJobMatchStatus({
        ...base,
        profileConfirmed: false,
        queueStatus: "completed",
      }),
    ).toEqual({ matchStatus: "no_confirmed_profile" });
  });
});
