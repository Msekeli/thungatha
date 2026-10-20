import { beforeEach, describe, expect, it, vi } from "vitest";
const { createClientMock, getJobProvidersMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getJobProvidersMock: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));
vi.mock("@/thungatha-features/job-discovery/server/providers/config", () => ({ getJobProviders: getJobProvidersMock }));
import { ingestJobs } from "@/thungatha-features/job-discovery/server/ingestion";
import type { JobProvider } from "@/thungatha-features/job-discovery/server/provider";
import type { NormalizedJob } from "@/thungatha-features/job-discovery/server/schema";
function job(overrides: Partial<NormalizedJob> = {}): NormalizedJob {
  return {
    providerKey: "test-provider",
    providerKind: "aggregator",
    externalJobId: "job-1",
    upstreamSource: null,
    title: "Software Developer",
    employerName: "Example Ltd",
    description: "Role description",
    locationText: "Cape Town",
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
function provider(searchJobs: JobProvider["searchJobs"]): JobProvider {
  return { key: "test-provider", kind: "aggregator", searchJobs };
}
describe("ingestJobs", () => {
  const call = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
    createClientMock.mockReturnValue({ rpc: call });
    call.mockImplementation(async (name: string) =>
      name === "start_job_ingestion_run"
        ? { data: "run-1", error: null }
        : name === "persist_job_ingestion_batch"
          ? {
              data: { received: 1, inserted: 1, updated: 0, skipped: 0 },
              error: null,
            }
          : { data: null, error: null },
    );
  });
  it("persists validated listings and closes a successful run", async () => {
    getJobProvidersMock.mockReturnValue([
      provider(vi.fn().mockResolvedValue([job()])),
    ]);
    const result = await ingestJobs();
    expect(result.totals).toEqual({
      received: 1,
      inserted: 1,
      updated: 0,
      skipped: 0,
      errors: 0,
    });
    expect(call).toHaveBeenCalledWith("persist_job_ingestion_batch", {
      p_run_id: "run-1",
      p_jobs: [job()],
    });
    expect(call).toHaveBeenCalledWith(
      "finish_job_ingestion_run",
      expect.objectContaining({ p_status: "succeeded" }),
    );
  });
  it("isolates provider outages and records failure without persistence", async () => {
    getJobProvidersMock.mockReturnValue([
      provider(vi.fn().mockRejectedValue(new Error("provider down"))),
    ]);
    const result = await ingestJobs();
    expect(result.providers[0]).toMatchObject({
      status: "failed",
      error: "provider down",
    });
    expect(call).toHaveBeenCalledWith(
      "finish_job_ingestion_run",
      expect.objectContaining({
        p_status: "failed",
        p_error_message: "provider down",
      }),
    );
    expect(call).not.toHaveBeenCalledWith(
      "persist_job_ingestion_batch",
      expect.anything(),
    );
  });
  it("skips malformed records and records a partial run", async () => {
    getJobProvidersMock.mockReturnValue([
      provider(vi.fn().mockResolvedValue([job({ title: "" })])),
    ]);
    const result = await ingestJobs();
    expect(result.providers[0]).toMatchObject({
      status: "partial",
      received: 1,
      skipped: 1,
    });
    expect(call).toHaveBeenCalledWith(
      "finish_job_ingestion_run",
      expect.objectContaining({ p_status: "partial", p_error_count: 1 }),
    );
  });
  it("rejects an empty provider registry", async () => {
    getJobProvidersMock.mockReturnValue([]);
    await expect(ingestJobs()).rejects.toThrow(
      "No job providers are configured.",
    );
  });
});
