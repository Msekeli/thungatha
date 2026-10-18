import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/jobs/[id]/activity/route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/identity", () => ({
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
const jobId = "123e4567-e89b-42d3-a456-426614174000";

function query(result: unknown) {
  // The Supabase fluent query builder is mocked only to exercise endpoint contracts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {};
  for (const method of ["select", "eq", "upsert"])
    builder[method] = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => result);
  builder.single = vi.fn(async () => result);
  builder.then = (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
  return builder;
}

const context = { params: Promise.resolve({ id: jobId }) };

describe("/api/jobs/[id]/activity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "user_alice", getToken: vi.fn() });
  });

  it("requires an authenticated identity", async () => {
    identity.mockResolvedValue(null);
    const response = await GET(
      new Request(`http://localhost/api/jobs/${jobId}/activity`),
      context,
    );
    expect(response.status).toBe(401);
    expect(client).not.toHaveBeenCalled();
  });

  it("returns only the current user's activity for a job", async () => {
    const activityQuery = query({
      data: {
        application_link_opened_at: "2026-10-17T10:00:00Z",
        applied_at: null,
      },
      error: null,
    });
    const from = vi.fn().mockReturnValue(activityQuery);
    client.mockResolvedValue({ from } as never);
    const response = await GET(
      new Request(`http://localhost/api/jobs/${jobId}/activity`),
      context,
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      activity: {
        application_link_opened_at: "2026-10-17T10:00:00Z",
        applied_at: null,
      },
    });
    expect(from).toHaveBeenCalledWith("user_job_activity");
    expect(activityQuery.eq).toHaveBeenCalledWith("user_id", "user_alice");
    expect(activityQuery.eq).toHaveBeenCalledWith("job_id", jobId);
  });

  it("records an application-link visit without marking the job applied", async () => {
    const jobQuery = query({ data: { id: jobId }, error: null });
    const sourceQuery = query({
      data: [
        {
          application_url: "https://careers.example.test/apply",
          availability_status: "active",
        },
      ],
      error: null,
    });
    const existingQuery = query({ data: null, error: null });
    const writeQuery = query({
      data: {
        application_link_opened_at: "2026-10-17T10:00:00Z",
        applied_at: null,
      },
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(jobQuery)
      .mockReturnValueOnce(sourceQuery)
      .mockReturnValueOnce(existingQuery)
      .mockReturnValueOnce(writeQuery);
    client.mockResolvedValue({ from } as never);
    const response = await POST(
      new Request(`http://localhost/api/jobs/${jobId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "opened_application" }),
      }),
      context,
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      activity: {
        application_link_opened_at: "2026-10-17T10:00:00Z",
        applied_at: null,
      },
    });
    expect(writeQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_alice",
        job_id: jobId,
        applied_at: null,
        application_link_opened_at: expect.any(String),
      }),
      { onConflict: "user_id,job_id" },
    );
  });

  it("records an application visit when only the source listing URL is available", async () => {
    const jobQuery = query({ data: { id: jobId }, error: null });
    const sourceQuery = query({
      data: [
        {
          application_url: null,
          source_url: "https://jobs.example.test/role",
          availability_status: "active",
        },
      ],
      error: null,
    });
    const existingQuery = query({ data: null, error: null });
    const writeQuery = query({
      data: {
        application_link_opened_at: "2026-10-17T10:00:00Z",
        applied_at: null,
      },
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(jobQuery)
      .mockReturnValueOnce(sourceQuery)
      .mockReturnValueOnce(existingQuery)
      .mockReturnValueOnce(writeQuery);
    client.mockResolvedValue({ from } as never);
    const response = await POST(
      new Request("http://localhost/api/jobs/" + jobId + "/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "opened_application" }),
      }),
      context,
    );
    expect(response.status).toBe(200);
    expect(sourceQuery.select).toHaveBeenCalledWith(
      "application_url,source_url,availability_status",
    );
    expect(writeQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_alice",
        job_id: jobId,
        applied_at: null,
        application_link_opened_at: expect.any(String),
      }),
      { onConflict: "user_id,job_id" },
    );
  });
  it("preserves an existing applied timestamp on duplicate confirmation", async () => {
    const appliedAt = "2026-10-16T08:30:00Z";
    const jobQuery = query({ data: { id: jobId }, error: null });
    const existingQuery = query({
      data: {
        application_link_opened_at: "2026-10-16T08:00:00Z",
        applied_at: appliedAt,
      },
      error: null,
    });
    const writeQuery = query({
      data: {
        application_link_opened_at: "2026-10-16T08:00:00Z",
        applied_at: appliedAt,
      },
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(jobQuery)
      .mockReturnValueOnce(existingQuery)
      .mockReturnValueOnce(writeQuery);
    client.mockResolvedValue({ from } as never);
    const response = await POST(
      new Request(`http://localhost/api/jobs/${jobId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_applied" }),
      }),
      context,
    );
    expect(response.status).toBe(200);
    expect(writeQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ applied_at: appliedAt }),
      { onConflict: "user_id,job_id" },
    );
  });
});
