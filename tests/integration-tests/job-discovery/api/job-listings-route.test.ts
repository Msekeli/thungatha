import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/jobs/route";
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

function query(result: unknown) {
  // Supabase's fluent query builder is intentionally mocked dynamically in these endpoint tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {};
  for (const method of [
    "select",
    "eq",
    "or",
    "ilike",
    "in",
    "not",
    "gte",
    "order",
    "range",
    "upsert",
    "delete",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
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

  it("returns filtered catalogue jobs through the public client when Clerk is not configured", async () => {
    configured.mockReturnValue(false);
    const feed = query({
      data: [{ id: "job-public", title: "Software Engineer", published_at: "2026-10-18T10:00:00Z" }],
      error: null,
      count: 1,
    });
    const details = query({
      data: [{ id: "job-public", title: "Software Engineer", job_sources: [] }],
      error: null,
      count: null,
    });
    const from = vi.fn().mockReturnValueOnce(feed).mockReturnValueOnce(details);
    publicClient.mockResolvedValue({ from } as never);
    const response = await GET(
      new Request(
        "http://localhost/api/jobs?query=software&location=Cape%20Town&countryCode=ZA&workMode=remote&employmentType=full-time&publishedWithin=7d&page=2&pageSize=10",
      ),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jobs: [{ id: "job-public", state: null }],
      page: 2,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    expect(publicClient).toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
    expect(from).toHaveBeenCalledTimes(2);
    expect(from).toHaveBeenNthCalledWith(1, "job_discovery_feed");
    expect(from).toHaveBeenNthCalledWith(2, "jobs");
    expect(feed.gte).toHaveBeenCalledWith("published_at", expect.any(String));
    expect(feed.not).toHaveBeenCalledWith("published_at", "is", null);
    expect(feed.or).toHaveBeenCalledWith(
      "title.ilike.%software%,employer_name.ilike.%software%,description.ilike.%software%",
    );
    expect(feed.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
    expect(feed.eq).toHaveBeenCalledWith("country_code", "ZA");
    expect(feed.eq).toHaveBeenCalledWith("work_mode", "remote");
    expect(feed.ilike).toHaveBeenCalledWith("employment_type", "%full_time%");
    expect(feed.range).toHaveBeenCalledWith(10, 19);
    expect(details.eq).toHaveBeenCalledWith("job_sources.availability_status", "active");
  });

  it("returns 503 when Clerk identity verification throws", async () => {
    identity.mockRejectedValue(new Error("Clerk unavailable"));
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(503);
    expect(client).not.toHaveBeenCalled();
  });

  it("does not query user state for anonymous requests", async () => {
    configured.mockReturnValue(false);
    const jobs = query({ data: [], error: null, count: 0 });
    const from = vi.fn().mockReturnValue(jobs);
    publicClient.mockResolvedValue({ from } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledTimes(1);
    expect(from).not.toHaveBeenCalledWith("user_job_states");
  });

  it("allows anonymous reads when Clerk is configured but the visitor is signed out", async () => {
    identity.mockResolvedValue(null);
    const jobs = query({ data: [], error: null, count: 0 });
    publicClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(jobs),
    } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(200);
    expect(publicClient).toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it("rejects invalid pagination and filter parameters", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/jobs?page=0&workMode=spaceship&publishedWithin=90d",
      ),
    );
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("returns persisted active jobs with publication-date sorting and the current user's state", async () => {
    const userStates = query({
      data: [{ job_id: "job-1", state: "saved" }],
      error: null,
    });
    const feed = query({
      data: [{ id: "job-1", title: "Software Engineer", published_at: "2026-10-10T10:00:00Z" }],
      error: null,
      count: 31,
    });
    const details = query({
      data: [{ id: "job-1", title: "Software Engineer", job_sources: [] }],
      error: null,
      count: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(userStates)
      .mockReturnValueOnce(feed)
      .mockReturnValueOnce(details);
    client.mockResolvedValue({ from } as never);

    const response = await GET(
      new Request(
        "http://localhost/api/jobs?query=software&location=Cape%20Town&countryCode=ZA&workMode=remote&employmentType=full-time&publishedWithin=7d&page=2&pageSize=10&sortOrder=oldest",
      ),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      jobs: [{ id: "job-1", title: "Software Engineer", job_sources: [], state: "saved" }],
      page: 2,
      pageSize: 10,
      total: 31,
      totalPages: 4,
    });
    expect(from).toHaveBeenNthCalledWith(1, "user_job_states");
    expect(from).toHaveBeenNthCalledWith(2, "job_discovery_feed");
    expect(from).toHaveBeenNthCalledWith(3, "jobs");
    expect(userStates.eq).toHaveBeenCalledWith("user_id", "user_alice");
    expect(feed.gte).toHaveBeenCalledWith("published_at", expect.any(String));
    expect(feed.not).toHaveBeenCalledWith("published_at", "is", null);
    expect(feed.order).toHaveBeenCalledWith("published_at", {
      ascending: true,
      nullsFirst: false,
    });
    expect(feed.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(feed.or).toHaveBeenCalledWith(
      "title.ilike.%software%,employer_name.ilike.%software%,description.ilike.%software%",
    );
    expect(feed.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
    expect(feed.eq).toHaveBeenCalledWith("country_code", "ZA");
    expect(feed.eq).toHaveBeenCalledWith("work_mode", "remote");
    expect(feed.ilike).toHaveBeenCalledWith("employment_type", "%full_time%");
    expect(feed.range).toHaveBeenCalledWith(10, 19);
    expect(details.in).toHaveBeenCalledWith("id", ["job-1"]);
    expect(details.eq).toHaveBeenCalledWith("job_sources.availability_status", "active");
  });

  it("treats search text as plain text rather than PostgREST filter syntax", async () => {
    const userStates = query({ data: [], error: null });
    const jobs = query({ data: [], error: null, count: 0 });
    client.mockResolvedValue({
      from: vi.fn().mockReturnValueOnce(userStates).mockReturnValueOnce(jobs),
    } as never);

    const response = await GET(
      new Request(
        "http://localhost/api/jobs?query=engineer%29%2Cid.eq.x&location=Cape%20Town%25",
      ),
    );

    expect(response.status).toBe(200);
    expect(jobs.or).toHaveBeenCalledWith(
      "title.ilike.%engineer id eq x%,employer_name.ilike.%engineer id eq x%,description.ilike.%engineer id eq x%",
    );
    expect(jobs.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
  });

  it("does not apply an implicit publication-age filter", async () => {
    const userStates = query({ data: [], error: null });
    const jobs = query({ data: [], error: null, count: 0 });
    client.mockResolvedValue({
      from: vi.fn().mockReturnValueOnce(userStates).mockReturnValueOnce(jobs),
    } as never);

    const response = await GET(new Request("http://localhost/api/jobs"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      page: 1,
      pageSize: 25,
      total: 0,
    });
    expect(jobs.gte).not.toHaveBeenCalledWith(
      "job_sources.published_at",
      expect.any(String),
    );
    expect(jobs.not).not.toHaveBeenCalledWith(
      "job_sources.published_at",
      "is",
      null,
    );
  });

  it("returns an empty result for a saved/dismissed state with no matching user states", async () => {
    const userStates = query({ data: [], error: null });
    const from = vi.fn().mockReturnValue(userStates);
    client.mockResolvedValue({ from } as never);
    const response = await GET(
      new Request("http://localhost/api/jobs?state=saved"),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      jobs: [],
      page: 1,
      pageSize: 25,
      total: 0,
      totalPages: 0,
    });
    expect(from).toHaveBeenCalledTimes(2);
  });

  it("excludes only this authenticated user's dismissed jobs from the normal feed", async () => {
    const userStates = query({
      data: [{ job_id: "job-dismissed", state: "dismissed" }],
      error: null,
    });
    const jobs = query({ data: [], error: null, count: 0 });
    const from = vi
      .fn()
      .mockReturnValueOnce(userStates)
      .mockReturnValueOnce(jobs);
    client.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost/api/jobs"));

    expect(response.status).toBe(200);
    expect(from).toHaveBeenNthCalledWith(1, "user_job_states");
    expect(userStates.eq).toHaveBeenCalledWith("user_id", "user_alice");
    expect(jobs.not).toHaveBeenCalledWith("id", "in", "(job-dismissed)");
  });

  it("returns a safe server error when the database query fails", async () => {
    const userStates = query({ data: [], error: null });
    const jobs = query({
      data: null,
      error: new Error("database detail"),
      count: null,
    });
    client.mockResolvedValue({
      from: vi.fn().mockReturnValueOnce(userStates).mockReturnValueOnce(jobs),
    } as never);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(await response.text()).not.toContain("database detail");
  });
});
