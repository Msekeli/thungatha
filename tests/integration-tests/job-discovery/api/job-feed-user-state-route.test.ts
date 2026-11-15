import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/jobs/route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
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
const client = vi.mocked(createAuthenticatedSupabaseClient);

describe("GET /api/jobs user state feed", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("maps saved state and excludes dismissed jobs from the default feed", async () => {
    const states = createQueryMock({
      data: [{ job_id: "dismissed-job", state: "dismissed" }, { job_id: scoutVacancyRecord.id, state: "saved" }],
      error: null,
    });
    const feed = createQueryMock({ data: [scoutVacancyRecord], error: null, count: 1 });
    const from = vi.fn().mockReturnValueOnce(states).mockReturnValueOnce(feed);
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jobs: [{ id: scoutVacancyRecord.id, state: "saved" }],
    });
    expect(feed.not).toHaveBeenCalledWith("id", "in", "(dismissed-job)");
  });

  it("returns an empty saved feed when the user has no saved vacancies", async () => {
    const states = createQueryMock({ data: [], error: null });
    const from = vi.fn().mockReturnValue(states);
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost/api/jobs?state=saved"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ jobs: [], total: 0 });
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("requires identity for user-state cache requests", async () => {
    identity.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/jobs?statesOnly=1"));
    expect(response.status).toBe(401);
  });
});
