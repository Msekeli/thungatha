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
  for (const method of ["select", "eq", "or", "ilike", "in", "not", "gte", "order", "range"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

const vacancy = {
  id: "job-1",
  scout_vacancy_id: "123e4567-e89b-42d3-a456-426614174000",
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

describe("GET /api/jobs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "user_alice", getToken: vi.fn() });
  });

  it("returns Scout vacancies to anonymous visitors, including unknown publication dates", async () => {
    configured.mockReturnValue(false);
    const feed = query({ data: [{ ...vacancy }], error: null, count: 1 });
    const from = vi.fn().mockReturnValue(feed);
    publicClient.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost/api/jobs"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jobs: [{ ...vacancy, state: null }],
      page: 1,
      pageSize: 25,
      total: 1,
      totalPages: 1,
    });
    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("job_discovery_feed");
    expect(feed.select).toHaveBeenCalledWith(
      "id,scout_vacancy_id,title,employer_name,company_logo_url,description,location_text,application_url,published_at,source_updated_at,updated_at",
      { count: "exact" },
    );
    expect(feed.not).not.toHaveBeenCalledWith("published_at", "is", null);
  });

  it("applies supported text, location and publication filters", async () => {
    configured.mockReturnValue(false);
    const feed = query({ data: [], error: null, count: 0 });
    publicClient.mockResolvedValue({ from: vi.fn().mockReturnValue(feed) } as never);

    const response = await GET(
      new Request("http://localhost/api/jobs?query=software&location=Cape%20Town&publishedWithin=7d&page=2&pageSize=10"),
    );

    expect(response.status).toBe(200);
    expect(feed.or).toHaveBeenCalledWith(
      "title.ilike.%software%,employer_name.ilike.%software%,description.ilike.%software%",
    );
    expect(feed.ilike).toHaveBeenCalledWith("location_text", "%Cape Town%");
    expect(feed.gte).toHaveBeenCalledWith("published_at", expect.any(String));
    expect(feed.range).toHaveBeenCalledWith(10, 19);
  });

  it("returns user-specific state while excluding dismissed jobs from the normal feed", async () => {
    const states = query({
      data: [{ job_id: "job-dismissed", state: "dismissed" }, { job_id: "job-1", state: "saved" }],
      error: null,
    });
    const feed = query({ data: [{ ...vacancy }], error: null, count: 1 });
    const from = vi.fn().mockReturnValueOnce(states).mockReturnValueOnce(feed);
    client.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost/api/jobs"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jobs: [{ id: "job-1", state: "saved" }],
      total: 1,
    });
    expect(from).toHaveBeenNthCalledWith(1, "user_job_states");
    expect(from).toHaveBeenNthCalledWith(2, "job_discovery_feed");
    expect(feed.not).toHaveBeenCalledWith("id", "in", "(job-dismissed)");
  });

  it("returns no rows when a saved or dismissed filter has no matching user states", async () => {
    const states = query({ data: [], error: null });
    const from = vi.fn().mockReturnValue(states);
    client.mockResolvedValue({ from } as never);

    const response = await GET(new Request("http://localhost/api/jobs?state=saved"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jobs: [],
      total: 0,
      totalPages: 0,
    });
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid pagination and publication filters", async () => {
    const response = await GET(
      new Request("http://localhost/api/jobs?page=0&publishedWithin=90d"),
    );
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("returns 503 when identity verification fails", async () => {
    identity.mockRejectedValue(new Error("Clerk unavailable"));
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(503);
  });
});
