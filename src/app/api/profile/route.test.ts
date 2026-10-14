import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { readProfile, saveProfile } from "@/lib/profile/repository";

vi.mock("@/lib/auth/identity", () => ({
  getAuthenticatedIdentity: vi.fn(),
  hasClerkConfiguration: vi.fn(),
}));
vi.mock("@/lib/profile/repository", () => ({
  readProfile: vi.fn(),
  saveProfile: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const read = vi.mocked(readProfile);
const save = vi.mocked(saveProfile);

describe("profile API authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configured.mockReturnValue(true);
  });

  it("returns 401 for reads and writes without a signed-in identity", async () => {
    identity.mockResolvedValue(null);

    const readResponse = await GET();
    const writeResponse = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Unauthenticated" }),
      }),
    );

    expect(readResponse.status).toBe(401);
    expect(writeResponse.status).toBe(401);
    expect(read).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("returns 503 with a useful setup error when Clerk is not configured", async () => {
    configured.mockReturnValue(false);

    const response = await PATCH(
      new Request("http://local/api/profile", { method: "PATCH" }),
    );

    expect(response.status).toBe(503);
    expect(identity).not.toHaveBeenCalled();
  });

  it("rejects an attempted client-supplied user ID", async () => {
    identity.mockResolvedValue({ userId: "user_real", getToken: vi.fn() });
    const response = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "A User", userId: "user_other" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it("reads and writes only with the server-resolved Clerk identity", async () => {
    const getToken = vi.fn().mockResolvedValue("clerk-session-jwt");
    identity.mockResolvedValue({ userId: "user_alice", getToken });
    read.mockResolvedValue({
      data: { display_name: "Alice" },
      error: null,
    } as never);
    save.mockResolvedValue({
      data: { display_name: "Alice Cooper" },
      error: null,
    } as never);

    const getResponse = await GET();
    const patchResponse = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Alice Cooper" }),
      }),
    );

    expect(read).toHaveBeenCalledWith("user_alice", getToken);
    expect(save).toHaveBeenCalledWith("user_alice", "Alice Cooper", getToken);
    expect(getResponse.status).toBe(200);
    expect(patchResponse.status).toBe(200);
  });

  it("returns the record scoped to each authenticated user", async () => {
    const getToken = vi.fn().mockResolvedValue("token");
    identity
      .mockResolvedValueOnce({ userId: "user_alice", getToken })
      .mockResolvedValueOnce({ userId: "user_bob", getToken });
    read.mockImplementation(
      async (userId) =>
        ({
          data: { display_name: userId === "user_alice" ? "Alice" : "Bob" },
          error: null,
        }) as never,
    );

    const alice = await GET();
    const bob = await GET();

    expect(read.mock.calls.map(([userId]) => userId)).toEqual([
      "user_alice",
      "user_bob",
    ]);
    await expect(alice.json()).resolves.toEqual({
      profile: { displayName: "Alice" },
    });
    await expect(bob.json()).resolves.toEqual({
      profile: { displayName: "Bob" },
    });
  });

  it("rejects malformed JSON and invalid display names", async () => {
    identity.mockResolvedValue({ userId: "user_alice", getToken: vi.fn() });
    const malformed = await PATCH(
      new Request("http://local/api/profile", { method: "PATCH", body: "{" }),
    );
    const invalid = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "   " }),
      }),
    );

    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});
