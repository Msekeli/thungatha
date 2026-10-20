import { describe, expect, it } from "vitest";

import { jobSearchQuerySchema, normalizedJobSchema } from "@/thungatha-features/job-discovery/server/schema";

const validJob = {
  providerKey: "example-ats",
  providerKind: "ats" as const,
  externalJobId: "job-123",
  title: "Software Engineer",
  employerName: "Example Ltd",
  description: "Build and maintain software.",
  locationText: "Cape Town, South Africa",
  countryCode: "ZA",
  workMode: "hybrid" as const,
  employmentType: "full_time",
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: null,
  publishedAt: "2026-10-14T09:00:00Z",
  sourceUrl: "https://jobs.example.com/roles/123",
  applicationUrl: null,
};

describe("normalizedJobSchema", () => {
  it("accepts a valid normalized job", () => {
    expect(normalizedJobSchema.safeParse(validJob).success).toBe(true);
  });

  it("allows missing employer, salary, publication date and application URL", () => {
    const result = normalizedJobSchema.safeParse({
      ...validJob,
      employerName: null,
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      publishedAt: null,
      applicationUrl: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(
      normalizedJobSchema.safeParse({
        ...validJob,
        title: " ",
      }).success,
    ).toBe(false);
  });

  it("rejects a missing external provider ID", () => {
    expect(
      normalizedJobSchema.safeParse({
        ...validJob,
        externalJobId: "",
      }).success,
    ).toBe(false);
  });

  it("rejects an unsupported work mode", () => {
    expect(
      normalizedJobSchema.safeParse({
        ...validJob,
        workMode: "flexible",
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed source URL", () => {
    expect(
      normalizedJobSchema.safeParse({
        ...validJob,
        sourceUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects a minimum salary greater than the maximum", () => {
    expect(
      normalizedJobSchema.safeParse({
        ...validJob,
        salaryMin: 100000,
        salaryMax: 50000,
      }).success,
    ).toBe(false);
  });

  it("rejects unexpected fields instead of silently accepting them", () => {
    expect(
      normalizedJobSchema.safeParse({
        ...validJob,
        inventedMatchScore: 95,
      }).success,
    ).toBe(false);
  });
});

describe("jobSearchQuerySchema", () => {
  it("applies bounded pagination defaults", () => {
    expect(jobSearchQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 25,
    });
  });

  it("rejects excessive page sizes", () => {
    expect(
      jobSearchQuerySchema.safeParse({
        pageSize: 1000,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid country codes", () => {
    expect(
      jobSearchQuerySchema.safeParse({
        countryCode: "South Africa",
      }).success,
    ).toBe(false);
  });
});
