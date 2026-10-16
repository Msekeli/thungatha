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
});
