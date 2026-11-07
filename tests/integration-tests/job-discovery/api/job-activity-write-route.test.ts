import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/jobs/[id]/activity/route";
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
const context = { params: Promise.resolve({ id: scoutVacancyRecord.id }) };

describe("POST /api/jobs/[id]/activity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("records a visit using the direct application URL on the Scout vacancy", async () => {
    const vacancy = createQueryMock({ data: { id: scoutVacancyRecord.id, application_url: scoutVacancyRecord.application_url }, error: null });
    const existing = createQueryMock({ data: null, error: null });
    const saved = { application_link_opened_at: "2026-11-07T10:00:00Z", applied_at: null };
    const write = createQueryMock({ data: saved, error: null });
    const from = vi.fn().mockReturnValueOnce(vacancy).mockReturnValueOnce(existing).mockReturnValueOnce(write);
    client.mockResolvedValue({ from } as never);
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ action: "opened_application" }),
    }), context);

    expect(response.status).toBe(200);
    expect(vacancy.not).toHaveBeenCalledWith("scout_vacancy_id", "is", null);
    expect(write.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "alice", job_id: scoutVacancyRecord.id }),
      { onConflict: "user_id,job_id" },
    );
  });

  it("rejects application visits when no direct URL exists", async () => {
    const vacancy = createQueryMock({ data: { id: scoutVacancyRecord.id, application_url: null }, error: null });
    client.mockResolvedValue({ from: vi.fn().mockReturnValue(vacancy) } as never);
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ action: "opened_application" }),
    }), context);
    expect(response.status).toBe(409);
  });

  it("preserves an existing applied timestamp on repeat confirmation", async () => {
    const appliedAt = "2026-11-06T08:30:00Z";
    const vacancy = createQueryMock({ data: { id: scoutVacancyRecord.id, application_url: null }, error: null });
    const existing = createQueryMock({ data: { application_link_opened_at: null, applied_at: appliedAt }, error: null });
    const write = createQueryMock({ data: { application_link_opened_at: null, applied_at: appliedAt }, error: null });
    const from = vi.fn().mockReturnValueOnce(vacancy).mockReturnValueOnce(existing).mockReturnValueOnce(write);
    client.mockResolvedValue({ from } as never);
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ action: "confirm_applied" }),
    }), context);
    expect(response.status).toBe(200);
    expect(write.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ applied_at: appliedAt }),
      { onConflict: "user_id,job_id" },
    );
  });
});
