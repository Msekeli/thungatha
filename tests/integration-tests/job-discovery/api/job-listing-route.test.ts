import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/jobs/[id]/route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import {
  createAuthenticatedSupabaseClient,
  createPublicSupabaseClient,
} from "@/lib/supabase/server";

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
const id = "123e4567-e89b-42d3-a456-426614174000";

function query(result: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {};
  for (const method of ["select", "eq", "not"]) builder[method] = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => result);
  return builder;
}

const vacancy = {
  id,
  scout_vacancy_id: "123e4567-e89b-42d3-a456-426614174001",
  title: "Software Engineer",
  employer_name: "Example Technologies",
  company_logo_url: null,
  description: "<h2>Role</h2><p>Build software applications with the team.</p>",
  location_text: "Cape Town",
  application_url: "https://careers.example.test/apply",
  published_at: null,
  source_updated_at: null,
  updated_at: "2026-11-07T10:00:00Z",
};

describe("GET /api/jobs/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("rejects malformed IDs before querying storage", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "bad" }),
    });
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("allows anonymous reads of Scout vacancies", async () => {
    configured.mockReturnValue(false);
    const jobQuery = query({ data: vacancy, error: null });
    const from = vi.fn().mockReturnValue(jobQuery);
    publicClient.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      job: { ...vacancy, state: null },
    });
    expect(from).toHaveBeenCalledWith("jobs");
    expect(jobQuery.not).toHaveBeenCalledWith("scout_vacancy_id", "is", null);
  });

  it("returns only the signed-in user's saved state", async () => {
    const jobQuery = query({ data: vacancy, error: null });
    const stateQuery = query({ data: { state: "saved" }, error: null });
    const from = vi.fn().mockReturnValueOnce(jobQuery).mockReturnValueOnce(stateQuery);
    client.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      job: { ...vacancy, state: "saved" },
    });
    expect(stateQuery.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(stateQuery.eq).toHaveBeenCalledWith("job_id", id);
  });

  it("returns 404 for records that are not Scout vacancies", async () => {
    const from = vi.fn().mockReturnValue(
      query({ data: null, error: null }),
    );
    publicClient.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(404);
  });
});
