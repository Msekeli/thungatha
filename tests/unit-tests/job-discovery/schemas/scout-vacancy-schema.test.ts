import { describe, expect, it } from "vitest";
import {
  scoutVacancyBatchSchema,
  scoutVacancySchema,
} from "@/thungatha-features/job-discovery/server/scout-vacancy-schema";
import { scoutVacancyPayload } from "@/tests/test-support/job-discovery-api-mocks";

describe("Scout vacancy schema", () => {
  it("accepts the exact nine-field receiving contract", () => {
    expect(scoutVacancySchema.parse(scoutVacancyPayload)).toEqual(scoutVacancyPayload);
  });

  it("rejects a missing required application URL", () => {
    const { applicationUrl: _applicationUrl, ...missingUrl } = scoutVacancyPayload;
    expect(scoutVacancySchema.safeParse(missingUrl).success).toBe(false);
  });

  it("rejects malformed Scout UUIDs", () => {
    expect(scoutVacancySchema.safeParse({
      ...scoutVacancyPayload,
      scoutVacancyId: "not-a-uuid",
    }).success).toBe(false);
  });

  it("rejects non-HTTP application destinations", () => {
    expect(scoutVacancySchema.safeParse({
      ...scoutVacancyPayload,
      applicationUrl: "javascript:alert(1)",
    }).success).toBe(false);
  });

  it("rejects extra fields", () => {
    expect(scoutVacancySchema.safeParse({
      ...scoutVacancyPayload,
      salary: 45000,
    }).success).toBe(false);
  });

  it("rejects duplicate Scout IDs within a batch", () => {
    expect(scoutVacancyBatchSchema.safeParse([
      scoutVacancyPayload,
      { ...scoutVacancyPayload, jobTitle: "Another role" },
    ]).success).toBe(false);
  });
});
