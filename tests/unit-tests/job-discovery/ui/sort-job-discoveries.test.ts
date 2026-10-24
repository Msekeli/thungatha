import { describe, expect, it } from "vitest";
import { sortJobDiscoveries } from "@/thungatha-features/job-discovery/ui/shared/sort-job-discoveries";

const jobs = [
  {
    id: "newer",
    title: "Software Engineer",
    employer_name: "Example",
    description: null,
    updated_at: "2026-10-24T10:00:00Z",
    job_sources: [{ published_at: "2026-10-23T10:00:00Z" }],
  },
  {
    id: "older",
    title: "Developer",
    employer_name: "Example",
    description: null,
    updated_at: "2026-10-24T11:00:00Z",
    job_sources: [{ published_at: "2026-10-10T10:00:00Z" }],
  },
  {
    id: "undated",
    title: "Analyst",
    employer_name: "Example",
    description: null,
    updated_at: "2026-10-24T12:00:00Z",
    job_sources: [{ published_at: null }],
  },
];

describe("sortJobDiscoveries", () => {
  it("sorts by publication date newest first, not record update time", () => {
    expect(sortJobDiscoveries(jobs, "newest").map((job) => job.id)).toEqual([
      "newer",
      "older",
      "undated",
    ]);
  });

  it("sorts by publication date oldest first and keeps undated jobs last", () => {
    expect(sortJobDiscoveries(jobs, "oldest").map((job) => job.id)).toEqual([
      "older",
      "newer",
      "undated",
    ]);
  });

  it("prioritises title matches for relevance searches", () => {
    expect(
      sortJobDiscoveries(jobs, "relevance", "software").map((job) => job.id)[0],
    ).toBe("newer");
  });
});
