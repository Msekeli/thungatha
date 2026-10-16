import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { getAuthenticatedIdentity, hasClerkConfiguration } from "@/lib/auth/identity";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/identity", () => ({ getAuthenticatedIdentity: vi.fn(), hasClerkConfiguration: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAuthenticatedSupabaseClient: vi.fn(), SupabaseConfigurationError: class SupabaseConfigurationError extends Error {} }));
const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const client = vi.mocked(createAuthenticatedSupabaseClient);

describe("GET /api/jobs/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "alice", getToken: vi.fn() });
  });
  it("rejects malformed IDs before querying storage", async () => {
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ id: "bad" }) });
    expect(response.status).toBe(400);
    expect(client).not.toHaveBeenCalled();
  });
  it("requires an authenticated identity", async () => {
    identity.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ id: "123e4567-e89b-42d3-a456-426614174000" }) });
    expect(response.status).toBe(401);
    expect(client).not.toHaveBeenCalled();
  });
});
