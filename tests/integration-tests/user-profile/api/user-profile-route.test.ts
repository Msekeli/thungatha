import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "@/app/api/profile/route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { readProfile, saveProfile } from "@/thungatha-features/user-profile/server/repository";

const { MockSupabaseConfigurationError } = vi.hoisted(() => {
  class MockSupabaseConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "SupabaseConfigurationError";
    }
  }

  return { MockSupabaseConfigurationError };
});

vi.mock("@/thungatha-features/authentication/server/identity", () => ({
  getAuthenticatedIdentity: vi.fn(),
  hasClerkConfiguration: vi.fn(),
}));

vi.mock("@/thungatha-features/user-profile/server/repository", () => ({
  readProfile: vi.fn(),
  saveProfile: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  SupabaseConfigurationError: MockSupabaseConfigurationError,
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const read = vi.mocked(readProfile);
const save = vi.mocked(saveProfile);

describe("profile API authorization and failure handling", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("returns 503 when Clerk is not configured", async () => {
    configured.mockReturnValue(false);

    const response = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(503);
    expect(identity).not.toHaveBeenCalled();
  });

  it("returns a safe error when identity resolution fails", async () => {
    const logSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    identity.mockRejectedValue(new Error("sensitive internal details"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Authentication could not be verified");
    expect(JSON.stringify(body)).not.toContain("sensitive internal details");

    expect(logSpy).toHaveBeenCalledWith(
      "Authentication identity resolution failed:",
      { errorName: "Error" },
    );
  });

  it("rejects a client-supplied user ID", async () => {
    identity.mockResolvedValue({
      userId: "user_real",
      getToken: vi.fn(),
    });

    const response = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: "A User",
          userId: "user_other",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it("reads and writes using the server-resolved identity", async () => {
    const getToken = vi.fn().mockResolvedValue("clerk-session-jwt");

    identity.mockResolvedValue({
      userId: "user_alice",
      getToken,
    });

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
        body: JSON.stringify({
          displayName: "Alice Cooper",
        }),
      }),
    );

    expect(read).toHaveBeenCalledWith("user_alice", getToken);
    expect(save).toHaveBeenCalledWith("user_alice", "Alice Cooper", getToken);
    expect(getResponse.status).toBe(200);
    expect(patchResponse.status).toBe(200);
  });

  it("returns records scoped to each authenticated user", async () => {
    const getToken = vi.fn().mockResolvedValue("token");

    identity
      .mockResolvedValueOnce({
        userId: "user_alice",
        getToken,
      })
      .mockResolvedValueOnce({
        userId: "user_bob",
        getToken,
      });

    read.mockImplementation(
      async (userId) =>
        ({
          data: {
            display_name: userId === "user_alice" ? "Alice" : "Bob",
          },
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
    identity.mockResolvedValue({
      userId: "user_alice",
      getToken: vi.fn(),
    });

    const malformed = await PATCH(
      new Request("http://local/api/profile", {
        method: "PATCH",
        body: "{",
      }),
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

  it("returns 503 when profile storage is not configured", async () => {
    identity.mockResolvedValue({
      userId: "user_alice",
      getToken: vi.fn(),
    });

    read.mockRejectedValue(
      new MockSupabaseConfigurationError("Storage unavailable"),
    );

    const response = await GET();

    expect(response.status).toBe(503);

    await expect(response.json()).resolves.toEqual({
      error: "Profile storage is not configured",
    });
  });

  it("returns a safe error and request ID for unexpected API failures", async () => {
    const logSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    identity.mockResolvedValue({
      userId: "user_alice",
      getToken: vi.fn(),
    });

    read.mockRejectedValue(new Error("sensitive database details"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(
      "The request could not be completed. Please try again.",
    );
    expect(body.requestId).toEqual(expect.any(String));
    expect(body.error).not.toContain("sensitive database details");

    expect(logSpy).toHaveBeenCalledWith(
      "API request failed:",
      expect.objectContaining({
        requestId: body.requestId,
        errorName: "Error",
      }),
    );
  });
});
