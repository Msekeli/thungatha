import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/jobs/[id]/route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { createAuthenticatedSupabaseClient, createPublicSupabaseClient } from "@/lib/supabase/server";
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
const publicClient = vi.mocked(createPublicSupabaseClient);
const id = scoutVacancyRecord.id;

describe("GET /api/jobs/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(false);
  });

  it("returns a public Scout vacancy, including null employer dates", async () => {
    const jobQuery = createQueryMock({ data: scoutVacancyRecord, error: null });
    publicClient.mockResolvedValue({ from: vi.fn().mockReturnValue(jobQuery) } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      job: { ...scoutVacancyRecord, state: null },
    });
    expect(jobQuery.not).toHaveBeenCalledWith("scout_vacancy_id", "is", null);
  });

  it("returns the signed-in user's saved state", async () => {
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
    const jobQuery = createQueryMock({ data: scoutVacancyRecord, error: null });
    const stateQuery = createQueryMock({ data: { state: "saved" }, error: null });
    const from = vi.fn().mockReturnValueOnce(jobQuery).mockReturnValueOnce(stateQuery);
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      job: { id, state: "saved" },
    });
    expect(stateQuery.eq).toHaveBeenCalledWith("user_id", "alice");
  });

  it("rejects malformed IDs and hides non-Scout records", async () => {
    const malformed = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "bad" }),
    });
    const jobQuery = createQueryMock({ data: null, error: null });
    publicClient.mockResolvedValue({ from: vi.fn().mockReturnValue(jobQuery) } as never);
    const missing = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });

    expect(malformed.status).toBe(400);
    expect(missing.status).toBe(404);
  });
});
