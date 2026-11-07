import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/jobs/[id]/activity/route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { createQueryMock, scoutVacancyRecord } from "@/tests/test-support/job-discovery-api-mocks";

vi.mock("@/thungatha-features/authentication/server/identity", () => ({
  getAuthenticatedIdentity: vi.fn(),
  hasClerkConfiguration: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createAuthenticatedSupabaseClient: vi.fn(),
  SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const client = vi.mocked(createAuthenticatedSupabaseClient);

describe("GET /api/jobs/[id]/activity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("requires a signed-in user", async () => {
    identity.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: scoutVacancyRecord.id }),
    });
    expect(response.status).toBe(401);
    expect(client).not.toHaveBeenCalled();
  });

  it("returns only the current user's application activity", async () => {
    const activity = { application_link_opened_at: "2026-11-07T10:00:00Z", applied_at: null };
    const query = createQueryMock({ data: activity, error: null });
    const from = vi.fn().mockReturnValue(query);
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: scoutVacancyRecord.id }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ activity });
    expect(from).toHaveBeenCalledWith("user_job_activity");
    expect(query.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(query.eq).toHaveBeenCalledWith("job_id", scoutVacancyRecord.id);
  });
});
