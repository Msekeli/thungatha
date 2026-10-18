import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getJobProvidersMock, consoleWarnMock } = vi.hoisted(() => ({
  getJobProvidersMock: vi.fn(),
  consoleWarnMock: vi.fn(),
}));

vi.mock("@/thungatha-features/job-discovery/server/providers/config", () => ({
  getJobProviders: getJobProvidersMock,
}));

vi.mock("server-only", () => ({}));

import { searchJobs } from "@/thungatha-features/job-discovery/server/search";
import type { JobProvider } from "@/thungatha-features/job-discovery/server/provider";
import type { NormalizedJob } from "@/thungatha-features/job-discovery/server/schema";

function createJob(overrides: Partial<NormalizedJob> = {}): NormalizedJob {
  return {
    providerKey: "test-provider",
    providerKind: "aggregator",
    externalJobId: "job-1",
    upstreamSource: null,
    title: "Software Developer",
    employerName: "Example Ltd",
    description: "A software development role.",
    locationText: "Cape Town, South Africa",
    countryCode: "ZA",
    workMode: "hybrid",
    employmentType: "Full-time",
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    publishedAt: null,
    sourceUrl: "https://example.com/jobs/1",
    applicationUrl: null,
    ...overrides,
  };
}

function createProvider(
  key: string,
  searchJobs: JobProvider["searchJobs"],
): JobProvider {
  return {
    key,
    kind: "aggregator",
    searchJobs,
  };
}

describe("searchJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(consoleWarnMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("limits results to the requested page size", async () => {
    const jobs = [
      createJob({ externalJobId: "1" }),
      createJob({ externalJobId: "2" }),
      createJob({ externalJobId: "3" }),
    ];

    getJobProvidersMock.mockReturnValue([
      createProvider("provider-a", vi.fn().mockResolvedValue(jobs)),
    ]);

    const result = await searchJobs({ page: 1, pageSize: 2 });

    expect(result).toHaveLength(2);
    expect(result.map((job) => job.externalJobId)).toEqual(["1", "2"]);
  });

  it("removes duplicate jobs from the same provider", async () => {
    const jobs = [
      createJob({ externalJobId: "1" }),
      createJob({ externalJobId: "1", title: "Duplicate listing" }),
      createJob({ externalJobId: "2" }),
    ];

    getJobProvidersMock.mockReturnValue([
      createProvider("test-provider", vi.fn().mockResolvedValue(jobs)),
    ]);

    const result = await searchJobs({ page: 1, pageSize: 10 });

    expect(result).toHaveLength(2);
    expect(result.map((job) => job.externalJobId)).toEqual(["1", "2"]);
  });

  it("keeps successful results and logs when a provider fails", async () => {
    const successfulJob = createJob({
      providerKey: "working-provider",
      externalJobId: "1",
    });

    getJobProvidersMock.mockReturnValue([
      createProvider(
        "working-provider",
        vi.fn().mockResolvedValue([successfulJob]),
      ),
      createProvider(
        "failing-provider",
        vi.fn().mockRejectedValue(new Error("Provider unavailable")),
      ),
    ]);

    const result = await searchJobs({ page: 1, pageSize: 10 });

    expect(result).toEqual([successfulJob]);
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "Some job providers failed during search:",
      [{ provider: "failing-provider", errorName: "Error" }],
    );
  });

  it("throws when all configured providers fail", async () => {
    getJobProvidersMock.mockReturnValue([
      createProvider(
        "provider-a",
        vi.fn().mockRejectedValue(new Error("Request failed")),
      ),
      createProvider(
        "provider-b",
        vi.fn().mockRejectedValue(new Error("Request failed")),
      ),
    ]);

    await expect(searchJobs({ page: 1, pageSize: 10 })).rejects.toThrow(
      "All configured job providers failed.",
    );
  });

  it("throws when no providers are configured", async () => {
    getJobProvidersMock.mockReturnValue([]);

    await expect(searchJobs({ page: 1, pageSize: 10 })).rejects.toThrow(
      "No job providers are configured.",
    );
  });
});
