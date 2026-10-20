import { afterEach, describe, expect, it, vi } from "vitest";

import { GreenhouseProvider } from "@/thungatha-features/job-discovery/server/providers/ats/greenhouse";

describe("GreenhouseProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires a board token", () => {
    expect(() => new GreenhouseProvider(" ")).toThrow(
      "A Greenhouse board token is required.",
    );
  });

  it("normalizes listings and filters by title and location", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          jobs: [
            {
              id: 123,
              title: "Software Engineer",
              absolute_url: "https://boards.greenhouse.io/example/jobs/123",
              location: { name: "Cape Town, South Africa" },
              content: "<p>Build reliable software.</p>",
            },
            {
              id: 456,
              title: "Product Designer",
              absolute_url: "https://boards.greenhouse.io/example/jobs/456",
              location: { name: "London, UK" },
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = new GreenhouseProvider("example");

    const jobs = await provider.searchJobs({
      query: "software",
      location: "Cape Town",
      page: 1,
      pageSize: 25,
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      providerKey: "greenhouse",
      providerKind: "ats",
      externalJobId: "123",
      title: "Software Engineer",
      locationText: "Cape Town, South Africa",
      countryCode: null,
      workMode: "unknown",
      salaryMin: null,
      salaryMax: null,
      publishedAt: null,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects unsuccessful provider responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );

    const provider = new GreenhouseProvider("example");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).rejects.toThrow("Greenhouse request failed with status 503.");
  });

  it("rejects malformed response payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ unexpected: [] }), { status: 200 }),
        ),
    );

    const provider = new GreenhouseProvider("example");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).rejects.toThrow("Greenhouse returned an invalid jobs response.");
  });

  it("does not return listings with invalid required fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            jobs: [
              {
                id: 123,
                title: " ",
                absolute_url: "https://boards.greenhouse.io/example/jobs/123",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const provider = new GreenhouseProvider("example");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).resolves.toEqual([]);
  });
});
