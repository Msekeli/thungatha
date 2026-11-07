import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/jobs/[id]/state/route";
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

describe("DELETE /api/jobs/[id]/state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("requires a signed-in user and a valid job ID", async () => {
    identity.mockResolvedValue(null);
    const unauthorised = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: scoutVacancyRecord.id }),
    });
    const invalid = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "bad" }),
    });
    expect(unauthorised.status).toBe(401);
    expect(invalid.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("deletes only the current user's saved/dismissed state", async () => {
    const stateQuery = createQueryMock({ data: null, error: null });
    const from = vi.fn().mockReturnValue(stateQuery);
    client.mockResolvedValue({ from } as never);
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: scoutVacancyRecord.id }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ state: null });
    expect(from).toHaveBeenCalledWith("user_job_states");
    expect(stateQuery.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(stateQuery.eq).toHaveBeenCalledWith("job_id", scoutVacancyRecord.id);
  });
});
