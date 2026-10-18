import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import {
  createAuthenticatedSupabaseClient,
  createPublicSupabaseClient,
} from "@/lib/supabase/server";

vi.mock("@/lib/auth/identity", () => ({
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
  // Supabase's fluent query builder is intentionally mocked dynamically in these endpoint tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {};
  for (const method of ["select", "eq"]) builder[method] = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => result);
  return builder;
}

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

  it("allows anonymous reads when Clerk is not configured", async () => {
    configured.mockReturnValue(false);
    const jobQuery = query({
      data: {
        id,
        title: "Software Engineer",
        job_sources: [{ availability_status: "active" }],
      },
      error: null,
    });
    publicClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(jobQuery),
    } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      job: {
        id,
        title: "Software Engineer",
        job_sources: [{ availability_status: "active" }],
        state: null,
      },
    });
    expect(publicClient).toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it("returns 503 when Clerk identity verification throws", async () => {
    identity.mockRejectedValue(new Error("Clerk unavailable"));
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(503);
    expect(client).not.toHaveBeenCalled();
  });

  it("allows anonymous reads when the visitor is signed out", async () => {
    identity.mockResolvedValue(null);
    const jobQuery = query({
      data: {
        id,
        title: "Software Engineer",
        job_sources: [{ availability_status: "active" }],
      },
      error: null,
    });
    publicClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(jobQuery),
    } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(200);
    expect(publicClient).toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it("returns an active persisted job and only the signed-in user's state", async () => {
    const job = {
      data: {
        id,
        title: "Software Engineer",
        job_sources: [{ availability_status: "active" }],
      },
      error: null,
    };
    const state = { data: { state: "saved" }, error: null };
    const jobQuery = query(job);
    const stateQuery = query(state);
    const from = vi
      .fn()
      .mockReturnValueOnce(jobQuery)
      .mockReturnValueOnce(stateQuery);
    client.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      job: { ...job.data, state: "saved" },
    });
    expect(jobQuery.eq).toHaveBeenCalledWith("id", id);
    expect(jobQuery.eq).toHaveBeenCalledWith(
      "job_sources.availability_status",
      "active",
    );
    expect(stateQuery.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(stateQuery.eq).toHaveBeenCalledWith("job_id", id);
  });

  it("returns 404 when no active listing exists", async () => {
    const from = vi
      .fn()
      .mockReturnValueOnce(query({ data: null, error: null }))
      .mockReturnValueOnce(query({ data: null, error: null }));
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(404);
  });

  it("returns a server error when the database fails", async () => {
    const from = vi
      .fn()
      .mockReturnValueOnce(
        query({ data: null, error: new Error("database detail") }),
      )
      .mockReturnValueOnce(query({ data: null, error: null }));
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(await response.text()).not.toContain("database detail");
  });
});
