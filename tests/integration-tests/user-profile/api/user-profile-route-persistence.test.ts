import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "@/app/api/profile/route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import {
  readProfile,
  saveProfile,
} from "@/thungatha-features/user-profile/server/repository";

vi.mock("@/thungatha-features/authentication/server/identity", () => ({
  getAuthenticatedIdentity: vi.fn(),
  hasClerkConfiguration: vi.fn(),
}));
vi.mock("@/thungatha-features/user-profile/server/repository", () => ({
  readProfile: vi.fn(),
  saveProfile: vi.fn(),
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const read = vi.mocked(readProfile);
const save = vi.mocked(saveProfile);

const patchReq = (body: unknown) =>
  new Request("http://local/api/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("profile API persistence and validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects client-supplied user ID", async () => {
    identity.mockResolvedValue({ userId: "u1", getToken: vi.fn() });
    const res = await PATCH(patchReq({ displayName: "A", userId: "u_other" }));
    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });

  it("reads and saves with server identity", async () => {
    const getToken = vi.fn().mockResolvedValue("jwt");
    identity.mockResolvedValue({ userId: "u_alice", getToken });
    read.mockResolvedValue({ data: { display_name: "Alice" }, error: null } as never);
    save.mockResolvedValue({ data: { display_name: "Alice C" }, error: null } as never);

    const getRes = await GET();
    const patchRes = await PATCH(patchReq({ displayName: "Alice C" }));
    expect(read).toHaveBeenCalledWith("u_alice", getToken);
    expect(save).toHaveBeenCalledWith("u_alice", { displayName: "Alice C" }, getToken);
    expect(getRes.status).toBe(200);
    expect(patchRes.status).toBe(200);
  });

  it("isolates profiles across users", async () => {
    const getToken = vi.fn().mockResolvedValue("jwt");
    identity
      .mockResolvedValueOnce({ userId: "u_alice", getToken })
      .mockResolvedValueOnce({ userId: "u_bob", getToken });
    read.mockImplementation(async (uid) => ({
      data: { display_name: uid === "u_alice" ? "Alice" : "Bob" },
      error: null,
    }) as never);

    const [alice, bob] = await Promise.all([GET(), GET()]);
    expect((await alice.json()).profile.displayName).toBe("Alice");
    expect((await bob.json()).profile.displayName).toBe("Bob");
  });

  it("saves full profile across sections", async () => {
    const getToken = vi.fn().mockResolvedValue("jwt");
    identity.mockResolvedValue({ userId: "u_lerato", getToken });
    const payload = {
      personalDetails: { fullName: "Lerato", email: "l@example.com" },
      skills: ["React"],
      confirmedAt: "2026-10-24T08:00:00.000Z",
    };
    save.mockResolvedValue({
      data: { display_name: "Lerato", skills: ["React"] },
      error: null,
    } as never);

    const res = await PATCH(patchReq(payload));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledWith("u_lerato", payload, getToken);
    expect((await res.json()).profile.skills).toEqual(["React"]);
  });
});
