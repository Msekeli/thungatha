import { describe, expect, it } from "vitest";
import {
  scoutExportPageSchema,
  scoutExportVacancySchema,
} from "@/thungatha-features/job-discovery/server/scout-export-schema";

const vacancy = {
  scout_vacancy_id: "123e4567-e89b-42d3-a456-426614174000",
  employer_name: "Example Technologies",
  logo_url: null,
  title: "Software Engineer",
  description: "<h2>About the role</h2><p>Build software with the team.</p>",
  location_text: null,
  application_url: "https://careers.example.test/jobs/123",
  published_at: null,
  source_updated_at: null,
  first_seen_at: "2026-11-07T10:00:00Z",
};

const page = {
  items: [vacancy],
  total: 1,
  limit: 100,
  offset: 0,
  has_more: false,
  location_scope: "south_africa",
};

describe("Scout export contract", () => {
  it("accepts Scout's complete export response without renaming its fields", () => {
    expect(scoutExportPageSchema.parse(page)).toEqual(page);
  });

  it("preserves nullable logo, location and employer dates", () => {
    expect(scoutExportVacancySchema.parse(vacancy)).toEqual(vacancy);
  });

  it("rejects invalid Scout vacancy identifiers", () => {
    expect(scoutExportVacancySchema.safeParse({
      ...vacancy,
      scout_vacancy_id: "invalid",
    }).success).toBe(false);
  });

  it("rejects non-HTTP application URLs", () => {
    expect(scoutExportVacancySchema.safeParse({
      ...vacancy,
      application_url: "javascript:alert(1)",
    }).success).toBe(false);
  });

  it("rejects additional vacancy fields rather than silently changing Scout's contract", () => {
    expect(scoutExportVacancySchema.safeParse({
      ...vacancy,
      salary: 50000,
    }).success).toBe(false);
  });

  it("rejects an invalid pagination scope", () => {
    expect(scoutExportPageSchema.safeParse({
      ...page,
      location_scope: "everywhere",
    }).success).toBe(false);
  });
});
