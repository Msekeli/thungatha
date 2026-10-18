import { afterEach, describe, expect, it, vi } from "vitest";
import { JoobleProvider } from "@/lib/jobs/providers/aggregators/jooble";

describe("JoobleProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires an API key", () => {
    expect(() => new JoobleProvider(" ")).toThrow(
      "A Jooble API key is required.",
    );
  });

  it("normalizes results and preserves source URLs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          totalCount: 1,
          jobs: [
            {
              title: "Software Developer",
              company: "Example Employer",
              location: "Cape Town",
              snippet: "Build software applications.",
              updated: "2026-10-13",
              link: "https://za.jooble.org/jdp/123456",
              source: "example-job-board.co.za",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = new JoobleProvider("test-key");
    const jobs = await provider.searchJobs({
      query: "Software Developer",
      location: "Cape Town",
      page: 1,
      pageSize: 25,
    });

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("https://jooble.org/api/test-key");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(options.body))).toEqual({
      keywords: "Software Developer",
      location: "Cape Town",
      page: 1,
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      providerKey: "jooble",
      providerKind: "aggregator",
      title: "Software Developer",
      employerName: "Example Employer",
      locationText: "Cape Town",
      sourceUrl: "https://za.jooble.org/jdp/123456",
      applicationUrl: null,
      countryCode: null,
      workMode: "unknown",
      publishedAt: null,
      upstreamSource: "example-job-board.co.za",
    });
  });

  it("filters results by query and location", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            jobs: [
              {
                title: "Software Developer",
                location: "Cape Town",
                link: "https://za.jooble.org/jdp/1",
              },
              {
                title: "Accountant",
                location: "Cape Town",
                link: "https://za.jooble.org/jdp/2",
              },
              {
                title: "Software Developer",
                location: "Durban",
                link: "https://za.jooble.org/jdp/3",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const provider = new JoobleProvider("test-key");
    const jobs = await provider.searchJobs({
      query: "Software Developer",
      location: "Cape Town",
      page: 1,
      pageSize: 25,
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Software Developer");
    expect(jobs[0].locationText).toBe("Cape Town");
  });

  it("throws when the provider returns a non-success status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );

    const provider = new JoobleProvider("test-key");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).rejects.toThrow("Jooble request failed with status 503.");
  });

  it("throws when the response has an invalid shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ totalCount: 3, results: [] }), {
          status: 200,
        }),
      ),
    );

    const provider = new JoobleProvider("test-key");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).rejects.toThrow("Jooble returned an invalid jobs response.");
  });

  it("skips jobs without a title", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            jobs: [
              {
                company: "Missing title",
                link: "https://za.jooble.org/jdp/1",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const provider = new JoobleProvider("test-key");
    const jobs = await provider.searchJobs({ page: 1, pageSize: 25 });

    expect(jobs).toEqual([]);
  });
});
