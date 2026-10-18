import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/lib/auth/identity";
import { createAuthenticatedSupabaseClient, createPublicSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/identity", () => ({ getAuthenticatedIdentity: vi.fn(), hasClerkConfiguration: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAuthenticatedSupabaseClient: vi.fn(), createPublicSupabaseClient: vi.fn(), SupabaseConfigurationError: class SupabaseConfigurationError extends Error {} }));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const client = vi.mocked(createAuthenticatedSupabaseClient);\nconst publicClient = vi.mocked(createPublicSupabaseClient);

function query(result: unknown) {
  // Supabase's fluent query builder is intentionally mocked dynamically in these endpoint tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {};
  for (const method of ["select", "eq", "or", "ilike", "in", "not", "gte", "order", "range", "upsert", "delete"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  builder.maybeSingle = vi.fn(async () => result);
  builder.single = vi.fn(async () => result);
  return builder;
}

describe("GET /api/jobs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "user_alice", getToken: vi.fn() });
  });

  it("returns public active jobs when Clerk is not configured", async () => {
    configured.mockReturnValue(false);
    const jobs = query({ data: [{ id: "job-public", title: "Software Engineer" }], error: null, count: 1 });
    publicClient.mockResolvedValue({ from: vi.fn().mockReturnValue(jobs) } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ jobs: [{ id: "job-public", state: null }], total: 1 });
    expect(publicClient).toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it("returns 503 when Clerk identity verification throws", async () => {
    identity.mockRejectedValue(new Error("Clerk unavailable"));
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(503);
    expect(client).not.toHaveBeenCalled();
  });

  it("allows anonymous reads when Clerk is configured but the visitor is signed out", async () => {
    identity.mockResolvedValue(null);
    const jobs = query({ data: [], error: null, count: 0 });
    publicClient.mockResolvedValue({ from: vi.fn().mockReturnValue(jobs) } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(200);
    expect(publicClient).toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it("rejects invalid pagination and filter parameters", async () => {
    const response = await GET(new Request("http://localhost/api/jobs?page=0&workMode=spaceship&publishedWithin=90d"));
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("returns persisted active jobs with pagination and the current user's state", async () => {
    const userStates = query({ data: [{ job_id: "job-1", state: "saved" }], error: null });
    const jobs = query({ data: [{ id: "job-1", title: "Software Engineer" }], error: null, count: 31 });
    const from = vi.fn().mockReturnValueOnce(userStates).mockReturnValueOnce(jobs);
    client.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost/api/jobs?query=software&location=Cape%20Town&countryCode=ZA&workMode=remote&employmentType=full-time&page=2&pageSize=10"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      jobs: [{ id: "job-1", title: "Software Engineer", state: "saved" }],
      page: 2, pageSize: 10, total: 31, totalPages: 4,
    });
    expect(from).toHaveBeenNthCalledWith(1, "user_job_states");
    expect(from).toHaveBeenNthCalledWith(2, "jobs");
    expect(userStates.eq).toHaveBeenCalledWith("user_id", "user_alice");
    expect(jobs.eq).toHaveBeenCalledWith("job_sources.availability_status", "active");
    expect(jobs.gte).toHaveBeenCalledWith("job_sources.published_at", expect.any(String));
    expect(jobs.not).toHaveBeenCalledWith("job_sources.published_at", "is", null);
    expect(jobs.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(jobs.order).toHaveBeenCalledWith("published_at", { referencedTable: "job_sources", ascending: false, nullsFirst: false });
    expect(jobs.or).toHaveBeenCalled();
    expect(jobs.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
    expect(jobs.eq).toHaveBeenCalledWith("country_code", "ZA");
    expect(jobs.eq).toHaveBeenCalledWith("work_mode", "remote");
    expect(jobs.ilike).toHaveBeenCalledWith("employment_type", "%full_time%");
    expect(jobs.range).toHaveBeenCalledWith(10, 19);
  });

  it("treats search text as plain text rather than PostgREST filter syntax", async () => {
    const userStates = query({ data: [], error: null });
    const jobs = query({ data: [], error: null, count: 0 });
    client.mockResolvedValue({ from: vi.fn().mockReturnValueOnce(userStates).mockReturnValueOnce(jobs) } as never);

    const response = await GET(new Request("http://localhost/api/jobs?query=engineer%29%2Cid.eq.x&location=Cape%20Town%25"));

    expect(response.status).toBe(200);
    expect(jobs.or).toHaveBeenCalledWith("title.ilike.%engineer id eq x%,employer_name.ilike.%engineer id eq x%");
    expect(jobs.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
  });

  it("returns an empty result for a saved/dismissed state with no matching user states", async () => {
    const userStates = query({ data: [], error: null });
    const from = vi.fn().mockReturnValue(userStates);
    client.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost/api/jobs?state=saved"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ jobs: [], page: 1, pageSize: 25, total: 0, totalPages: 0 });
    expect(from).toHaveBeenCalledTimes(2);
  });

  it("returns a safe server error when the database query fails", async () => {
    const userStates = query({ data: [], error: null });
    const jobs = query({ data: null, error: new Error("database detail"), count: null });
    client.mockResolvedValue({ from: vi.fn().mockReturnValueOnce(userStates).mockReturnValueOnce(jobs) } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBeGreaterThanOrEqual(500);
    expect((await response.text())).not.toContain("database detail");
  });
});
