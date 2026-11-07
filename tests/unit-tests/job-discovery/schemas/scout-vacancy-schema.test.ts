import { describe, expect, it } from "vitest";
import {
  scoutVacancyBatchSchema,
  scoutVacancySchema,
} from "@/thungatha-features/job-discovery/server/scout-vacancy-schema";

const validVacancy = {
  scoutVacancyId: "123e4567-e89b-42d3-a456-426614174000",
  jobTitle: "Software Engineer",
  companyName: "Example Technologies",
  companyLogoUrl: null,
  location: "Cape Town, South Africa",
  description:
    "<h2>About the role</h2>\n<p>Build and maintain software applications with the engineering team.</p>\n<ul><li>Use React and TypeScript.</li><li>Build REST APIs.</li></ul>",
  applicationUrl: "https://careers.example.com/jobs/123",
  publishedAt: null,
  updatedAt: null,
};

describe("Scout vacancy contract", () => {
  it("accepts the exact nine-field contract with nullable optional values", () => {
    expect(scoutVacancySchema.parse(validVacancy)).toEqual(validVacancy);
  });

  it("preserves the sanitised HTML description without trimming or flattening", () => {
    const description = `  ${validVacancy.description}\n  `;
    const result = scoutVacancySchema.parse({
      ...validVacancy,
      description,
    });

    expect(result.description).toBe(description);
    expect(result.description).toContain("<h2>");
    expect(result.description).toContain("<ul>");
  });

  it("allows an optional company logo", () => {
    expect(
      scoutVacancySchema.safeParse({
        ...validVacancy,
        companyLogoUrl: null,
      }).success,
    ).toBe(true);
  });

  it("rejects a missing required field", () => {
    const { applicationUrl: _applicationUrl, ...missingApplicationUrl } =
      validVacancy;

    expect(scoutVacancySchema.safeParse(missingApplicationUrl).success).toBe(
      false,
    );
  });

  it("rejects a malformed vacancy UUID", () => {
    expect(
      scoutVacancySchema.safeParse({
        ...validVacancy,
        scoutVacancyId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("rejects empty or meaningless descriptions", () => {
    expect(
      scoutVacancySchema.safeParse({
        ...validVacancy,
        description: "<h2></h2><p>   </p>",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid application URLs", () => {
    expect(
      scoutVacancySchema.safeParse({
        ...validVacancy,
        applicationUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });

  it("rejects unexpected payload fields", () => {
    expect(
      scoutVacancySchema.safeParse({
        ...validVacancy,
        salary: "not part of the Scout contract",
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate Scout vacancy IDs within one batch", () => {
    expect(
      scoutVacancyBatchSchema.safeParse([
        validVacancy,
        { ...validVacancy, jobTitle: "Another Engineer" },
      ]).success,
    ).toBe(false);
  });
});
