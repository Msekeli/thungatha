import { describe, expect, it } from "vitest";
import { scoutVacancySchema } from "@/thungatha-features/job-discovery/server/scout-vacancy-schema";
import { scoutVacancyPayload } from "@/tests/test-support/job-discovery-api-mocks";

describe("Scout vacancy optional fields and HTML", () => {
  it("preserves the sanitised HTML string exactly", () => {
    const description = `  ${scoutVacancyPayload.description}\n  `;
    const result = scoutVacancySchema.parse({
      ...scoutVacancyPayload,
      description,
    });
    expect(result.description).toBe(description);
    expect(result.description).toContain("<h2>");
    expect(result.description).toContain("<ul>");
  });

  it("accepts a missing logo and unavailable employer dates as null", () => {
    expect(scoutVacancySchema.parse({
      ...scoutVacancyPayload,
      companyLogoUrl: null,
      publishedAt: null,
      updatedAt: null,
    })).toMatchObject({
      companyLogoUrl: null,
      publishedAt: null,
      updatedAt: null,
    });
  });

  it("rejects a description without meaningful visible content", () => {
    expect(scoutVacancySchema.safeParse({
      ...scoutVacancyPayload,
      description: "<h2></h2><p>   </p>",
    }).success).toBe(false);
  });
});
