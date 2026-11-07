import { beforeEach, describe, expect, it, vi } from "vitest";
import { PUT } from "@/app/api/jobs/[id]/state/route";
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
const id = scoutVacancyRecord.id;
const context = { params: Promise.resolve({ id }) };

describe("PUT /api/jobs/[id]/state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("rejects invalid states and malformed JSON before database access", async () => {
    const invalid = await PUT(new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ state: "applied" }),
    }), context);
    const malformed = await PUT(new Request("http://localhost", {
      method: "PUT",
      body: "{",
    }), context);
    expect(invalid.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it.each(["saved", "dismissed"] as const)("persists %s state for a Scout vacancy", async (state) => {
    const vacancy = createQueryMock({ data: { id }, error: null });
    const saved = { job_id: id, state, updated_at: "2026-11-07T10:00:00Z" };
    const stateQuery = createQueryMock({ data: saved, error: null });
    const from = vi.fn().mockReturnValueOnce(vacancy).mockReturnValueOnce(stateQuery);
    client.mockResolvedValue({ from } as never);
    const response = await PUT(new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ state }),
    }), context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ state: saved });
    expect(vacancy.not).toHaveBeenCalledWith("scout_vacancy_id", "is", null);
    expect(stateQuery.upsert).toHaveBeenCalledWith(
      { user_id: "alice", job_id: id, state },
      { onConflict: "user_id,job_id" },
    );
  });

  it("does not allow saving a legacy record without a Scout ID", async () => {
    const vacancy = createQueryMock({ data: null, error: null });
    client.mockResolvedValue({ from: vi.fn().mockReturnValue(vacancy) } as never);
    const response = await PUT(new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ state: "saved" }),
    }), context);
    expect(response.status).toBe(404);
  });
});
