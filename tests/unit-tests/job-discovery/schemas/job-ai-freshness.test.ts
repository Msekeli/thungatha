import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isAssessmentInputCurrent } from "@/thungatha-features/job-discovery/server/job-ai-freshness";

const description = "Build and maintain software applications.";
const expected = {
  profile_version: 4,
  job_description_hash: createHash("sha256").update(description).digest("hex"),
};
const current = { description, profileVersion: 4, confirmedAt: "2026-11-21T08:00:00.000Z" };

describe("assessment input freshness", () => {
  it("accepts the exact confirmed Profile version and job description", () => {
    expect(isAssessmentInputCurrent(expected, current)).toBe(true);
  });
  it("rejects a changed Profile version", () => {
    expect(isAssessmentInputCurrent(expected, { ...current, profileVersion: 5 })).toBe(false);
  });
  it("rejects a changed job description", () => {
    expect(isAssessmentInputCurrent(expected, { ...current, description: "A different role." })).toBe(false);
  });
  it("rejects a missing or unconfirmed Profile", () => {
    expect(isAssessmentInputCurrent(expected, { ...current, confirmedAt: null })).toBe(false);
    expect(isAssessmentInputCurrent(expected, { ...current, profileVersion: null })).toBe(false);
  });
  it("rejects a deleted job description", () => {
    expect(isAssessmentInputCurrent(expected, { ...current, description: null })).toBe(false);
  });
});
