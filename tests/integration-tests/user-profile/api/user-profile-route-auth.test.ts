import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "@/app/api/profile/route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { readProfile } from "@/thungatha-features/user-profile/server/repository";

const { MockSupabaseConfigError } = vi.hoisted(() => {
  class MockSupabaseConfigError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = "SupabaseConfigurationError";
    }
  }
  return { MockSupabaseConfigError };
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
  SupabaseConfigurationError: MockSupabaseConfigError,
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const read = vi.mocked(readProfile);

describe("profile API auth and failure handling", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns 401 without signed-in identity", async () => {
    identity.mockResolvedValue(null);
    const [readRes, writeRes] = await Promise.all([
      GET(),
      PATCH(
        new Request("http://local/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ displayName: "Anon" }),
        }),
      ),
    ]);
    expect(readRes.status).toBe(401);
    expect(writeRes.status).toBe(401);
  });

  it("returns 503 when Clerk is not configured", async () => {
    configured.mockReturnValue(false);
    const res = await PATCH(new Request("http://local/api/profile", { method: "PATCH" }));
    expect(res.status).toBe(503);
  });

  it("masks errors safely when identity throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    identity.mockRejectedValue(new Error("sensitive"));
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("Authentication could not be verified");
  });

  it("returns 503 when profile storage is not configured", async () => {
    identity.mockResolvedValue({ userId: "u1", getToken: vi.fn() });
    read.mockRejectedValue(new MockSupabaseConfigError("missing"));
    expect((await GET()).status).toBe(503);
  });

  it("returns safe 500 on unexpected errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    identity.mockResolvedValue({ userId: "u1", getToken: vi.fn() });
    read.mockRejectedValue(new Error("db failure"));
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("The request could not be completed. Please try again.");
  });
});
