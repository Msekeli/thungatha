import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/jobs/route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { createQueryMock, scoutVacancyRecord } from "@/tests/test-support/job-discovery-api-mocks";

vi.mock("@/thungatha-features/authentication/server/identity", () => ({
  getAuthenticatedIdentity: vi.fn(),
  hasClerkConfiguration: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createAuthenticatedSupabaseClient: vi.fn(),
  createPublicSupabaseClient: vi.fn(),
  SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const publicClient = vi.mocked(createPublicSupabaseClient);

describe("GET /api/jobs public feed", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(false);
  });

  it("includes Scout vacancies with unknown publication dates", async () => {
    const feed = createQueryMock({ data: [scoutVacancyRecord], error: null, count: 1 });
    const from = vi.fn().mockReturnValue(feed);
    publicClient.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jobs: [{ ...scoutVacancyRecord, state: null }],
      total: 1,
    });
    expect(from).toHaveBeenCalledWith("job_discovery_feed");
    expect(feed.gte).not.toHaveBeenCalled();
  });

  it("applies supported text, location and publication filters", async () => {
    const feed = createQueryMock({ data: [], error: null, count: 0 });
    publicClient.mockResolvedValue({ from: vi.fn().mockReturnValue(feed) } as never);
    const response = await GET(new Request(
      "http://localhost/api/jobs?query=software&location=Cape%20Town&publishedWithin=7d&page=2&pageSize=10",
    ));

    expect(response.status).toBe(200);
    expect(feed.or).toHaveBeenCalledWith(
      "title.ilike.%software%,employer_name.ilike.%software%,description.ilike.%software%",
    );
    expect(feed.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
    expect(feed.gte).toHaveBeenCalledWith("published_at", expect.any(String));
    expect(feed.range).toHaveBeenCalledWith(10, 19);
  });

  it("rejects invalid pagination and does not attempt identity lookup when Clerk is off", async () => {
    const response = await GET(new Request("http://localhost/api/jobs?page=0"));
    expect(response.status).toBe(400);
    expect(identity).not.toHaveBeenCalled();
  });
});
