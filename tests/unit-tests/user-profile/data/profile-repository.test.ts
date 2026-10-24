import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import {
  PROFILE_SELECT_COLUMNS,
  readProfile,
  saveProfile,
} from "@/thungatha-features/user-profile/server/repository";

vi.mock("@/lib/supabase/server", () => ({
  createAuthenticatedSupabaseClient: vi.fn(),
}));
vi.mock("server-only", () => ({}));

const createClient = vi.mocked(createAuthenticatedSupabaseClient);

describe("profile repository ownership scope", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filters profile reads by the Clerk identity passed by the server route", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    createClient.mockResolvedValue({ from } as never);
    const getToken = vi.fn().mockResolvedValue("session-token");

    await readProfile("user_alice", getToken);

    expect(createClient).toHaveBeenCalledWith(getToken);
    expect(from).toHaveBeenCalledWith("profiles");
    expect(select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
    expect(eq).toHaveBeenCalledWith("user_id", "user_alice");
  });

  it("writes the server-resolved owner ID and no client-selected identity", async () => {
    const single = vi.fn().mockResolvedValue({ data: { display_name: "Alice" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const upsert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ upsert });
    createClient.mockResolvedValue({ from } as never);
    const getToken = vi.fn().mockResolvedValue("session-token");

    await saveProfile("user_alice", "Alice", getToken);

    expect(upsert).toHaveBeenCalledWith(
      { user_id: "user_alice", display_name: "Alice" },
      { onConflict: "user_id" },
    );
  });

  it("maps structured profile input fields to database columns", async () => {
    const single = vi.fn().mockResolvedValue({ data: {}, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const upsert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ upsert });
    createClient.mockResolvedValue({ from } as never);
    const getToken = vi.fn().mockResolvedValue("session-token");

    await saveProfile(
      "user_alice",
      {
        personalDetails: { fullName: "Alice", email: "alice@example.com" },
        skills: ["TypeScript"],
      },
      getToken,
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_alice",
        display_name: "Alice",
        full_name: "Alice",
        email: "alice@example.com",
        skills: ["TypeScript"],
      }),
      { onConflict: "user_id" },
    );
  });
});
