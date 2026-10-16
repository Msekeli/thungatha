import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/lib/auth/identity";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/identity", () => ({ getAuthenticatedIdentity: vi.fn(), hasClerkConfiguration: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAuthenticatedSupabaseClient: vi.fn(), SupabaseConfigurationError: class SupabaseConfigurationError extends Error {} }));
const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const client = vi.mocked(createAuthenticatedSupabaseClient);

describe("GET /api/jobs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "user_alice", getToken: vi.fn() });
  });
  it("returns 503 when authentication is not configured", async () => {
    configured.mockReturnValue(false);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(503);
    expect(client).not.toHaveBeenCalled();
  });
  it("requires an authenticated identity", async () => {
    identity.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/jobs"));
    expect(response.status).toBe(401);
    expect(client).not.toHaveBeenCalled();
  });
  it("rejects invalid pagination and filter parameters", async () => {
    const response = await GET(new Request("http://localhost/api/jobs?page=0&workMode=spaceship"));
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });
});
