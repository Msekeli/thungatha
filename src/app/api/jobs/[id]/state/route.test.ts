import { beforeEach, describe, expect, it, vi } from "vitest";
import { PUT, DELETE } from "./route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/lib/auth/identity";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/identity", () => ({ getAuthenticatedIdentity: vi.fn(), hasClerkConfiguration: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAuthenticatedSupabaseClient: vi.fn(), SupabaseConfigurationError: class SupabaseConfigurationError extends Error {} }));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const client = vi.mocked(createAuthenticatedSupabaseClient);
const id = "123e4567-e89b-42d3-a456-426614174000";

function query(result: unknown) {
  const builder: Record<string, any> = {};
  for (const method of ["select", "eq", "upsert", "delete"]) builder[method] = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => result);
  builder.single = vi.fn(async () => result);
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return builder;
}

describe("job state API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });

  it("rejects state values outside saved and dismissed", async () => {
    const response = await PUT(new Request("http://localhost", { method: "PUT", body: JSON.stringify({ state: "applied" }) }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("rejects malformed IDs before querying storage", async () => {
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: "bad" }) });
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it("requires authentication before allowing state changes", async () => {
    identity.mockResolvedValue(null);
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(401);
    expect(client).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and extra body fields", async () => {
    const malformed = await PUT(new Request("http://localhost", { method: "PUT", body: "{" }), { params: Promise.resolve({ id }) });
    const extra = await PUT(new Request("http://localhost", { method: "PUT", body: JSON.stringify({ state: "saved", userId: "bob" }) }), { params: Promise.resolve({ id }) });
    expect(malformed.status).toBe(400);
    expect(extra.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });

  it.each(["saved", "dismissed"] as const)("persists the %s state for the authenticated user only", async (state) => {
    const jobQuery = query({ data: { id }, error: null });
    const stateQuery = query({ data: { job_id: id, state, updated_at: "2026-10-16T10:00:00Z" }, error: null });
    const from = vi.fn().mockReturnValueOnce(jobQuery).mockReturnValueOnce(stateQuery);
    client.mockResolvedValue({ from } as never);

    const response = await PUT(new Request("http://localhost", { method: "PUT", body: JSON.stringify({ state }) }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ state: { job_id: id, state, updated_at: "2026-10-16T10:00:00Z" } });
    expect(jobQuery.eq).toHaveBeenCalledWith("id", id);
    expect(jobQuery.eq).toHaveBeenCalledWith("job_sources.availability_status", "active");
    expect(stateQuery.upsert).toHaveBeenCalledWith(
      { user_id: "alice", job_id: id, state },
      { onConflict: "user_id,job_id" },
    );
  });

  it("does not allow saving a listing that is no longer active", async () => {
    const from = vi.fn().mockReturnValue(query({ data: null, error: null }));
    client.mockResolvedValue({ from } as never);
    const response = await PUT(new Request("http://localhost", { method: "PUT", body: JSON.stringify({ state: "saved" }) }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(404);
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("deletes only the current user's state for this job", async () => {
    const stateQuery = query({ data: null, error: null });
    const from = vi.fn().mockReturnValue(stateQuery);
    client.mockResolvedValue({ from } as never);
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ state: null });
    expect(from).toHaveBeenCalledWith("user_job_states");
    expect(stateQuery.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(stateQuery.eq).toHaveBeenCalledWith("job_id", id);
  });

  it("does not expose database error details", async () => {
    client.mockResolvedValue({ from: vi.fn().mockReturnValue(query({ data: null, error: new Error("database detail") })) } as never);
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id }) });
    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(await response.text()).not.toContain("database detail");
  });
});
