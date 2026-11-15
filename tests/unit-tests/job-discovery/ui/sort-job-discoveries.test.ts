import { describe, expect, it } from "vitest";
import { sortJobDiscoveries } from "@/thungatha-features/job-discovery/ui/shared/sort-job-discoveries";

const jobs = [
  {
    id: "newer",
    title: "Software Engineer",
    employer_name: "Example",
    description: "Build software",
    published_at: "2026-10-23T10:00:00Z",
  },
  {
    id: "older",
    title: "Developer",
    employer_name: "Example",
    description: "Develop services",
    published_at: "2026-10-10T10:00:00Z",
  },
  {
    id: "undated",
    title: "Analyst",
    employer_name: "Example",
    description: "Analyse business requirements",
    published_at: null,
  },
];

describe("sortJobDiscoveries", () => {
  it("sorts by original publication date, newest first, and keeps undated vacancies last", () => {
    expect(sortJobDiscoveries(jobs, "newest").map((job) => job.id)).toEqual([
      "newer",
      "older",
      "undated",
    ]);
  });

  it("sorts by publication date oldest first and keeps undated vacancies last", () => {
    expect(sortJobDiscoveries(jobs, "oldest").map((job) => job.id)).toEqual([
      "older",
      "newer",
      "undated",
    ]);
  });

  it("prioritises title matches for relevance searches", () => {
    expect(sortJobDiscoveries(jobs, "relevance", "software")[0].id).toBe("newer");
  });
});
