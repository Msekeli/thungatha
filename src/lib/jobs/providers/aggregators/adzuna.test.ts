import { afterEach, describe, expect, it, vi } from "vitest";
import { AdzunaProvider } from "./adzuna";

describe("AdzunaProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires both API credentials", () => {
    expect(() => new AdzunaProvider("", "test-key")).toThrow(
      "Adzuna API credentials are required.",
    );

    expect(() => new AdzunaProvider("test-id", " ")).toThrow(
      "Adzuna API credentials are required.",
    );
  });

  it("normalizes job results and builds the expected request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          count: 1,
          results: [
            {
              id: "12345",
              title: "Software Developer",
              created: "2026-10-13T09:00:00Z",
              description: "Build software applications.",
              redirect_url: "https://www.adzuna.co.za/details/12345",
              company: { display_name: "Example Employer" },
              location: { display_name: "Cape Town, Western Cape" },
              contract_type: "permanent",
              contract_time: "full_time",
              salary_min: 30000,
              salary_max: 45000,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = new AdzunaProvider("test-id", "test-key");
    const jobs = await provider.searchJobs({
      query: "Software Developer",
      location: "Cape Town",
      page: 2,
      pageSize: 10,
    });

    expect(fetchMock).toHaveBeenCalledOnce();

    const [requestUrl, options] = fetchMock.mock.calls[0] as [URL, RequestInit];

    const url = new URL(String(requestUrl));

    expect(url.origin).toBe("https://api.adzuna.com");
    expect(url.pathname).toBe("/v1/api/jobs/za/search/2");
    expect(url.searchParams.get("app_id")).toBe("test-id");
    expect(url.searchParams.get("app_key")).toBe("test-key");
    expect(url.searchParams.get("results_per_page")).toBe("10");
    expect(url.searchParams.get("what")).toBe("Software Developer");
    expect(url.searchParams.get("where")).toBe("Cape Town");
    expect(options.cache).toBe("no-store");

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      providerKey: "adzuna",
      providerKind: "aggregator",
      externalJobId: "12345",
      title: "Software Developer",
      employerName: "Example Employer",
      locationText: "Cape Town, Western Cape",
      employmentType: "permanent full_time",
      salaryMin: 30000,
      salaryMax: 45000,
      salaryCurrency: null,
      publishedAt: "2026-10-13T09:00:00.000Z",
      sourceUrl: "https://www.adzuna.co.za/details/12345",
      applicationUrl: null,
      countryCode: null,
      workMode: "unknown",
    });
  });

  it("filters results by query and location", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [
              {
                id: "1",
                title: "Software Developer",
                location: { display_name: "Cape Town" },
              },
              {
                id: "2",
                title: "Accountant",
                location: { display_name: "Cape Town" },
              },
              {
                id: "3",
                title: "Software Developer",
                location: { display_name: "Durban" },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const provider = new AdzunaProvider("test-id", "test-key");
    const jobs = await provider.searchJobs({
      query: "Software Developer",
      location: "Cape Town",
      page: 1,
      pageSize: 25,
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].externalJobId).toBe("1");
  });

  it("throws when the provider returns a non-success status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );

    const provider = new AdzunaProvider("test-id", "test-key");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).rejects.toThrow("Adzuna request failed with status 503.");
  });

  it("throws when the response has an invalid shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ results: "invalid" }), {
          status: 200,
        }),
      ),
    );

    const provider = new AdzunaProvider("test-id", "test-key");

    await expect(
      provider.searchJobs({ page: 1, pageSize: 25 }),
    ).rejects.toThrow("Adzuna returned an invalid jobs response.");
  });

  it("skips jobs without an ID or title", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [{ id: "1", title: " " }, { title: "Software Developer" }],
          }),
          { status: 200 },
        ),
      ),
    );

    const provider = new AdzunaProvider("test-id", "test-key");
    const jobs = await provider.searchJobs({ page: 1, pageSize: 25 });

    expect(jobs).toEqual([]);
  });

  it("handles invalid salary values without accepting negatives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [
              {
                id: "1",
                title: "Software Developer",
                salary_min: -100,
                salary_max: 50000,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const provider = new AdzunaProvider("test-id", "test-key");
    const jobs = await provider.searchJobs({ page: 1, pageSize: 25 });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].salaryMin).toBeNull();
    expect(jobs[0].salaryMax).toBe(50000);
  });
});
