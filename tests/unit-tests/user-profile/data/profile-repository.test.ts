import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";
import { PROFILE_SELECT_COLUMNS, readProfile, saveProfile } from "@/thungatha-features/user-profile/server/repository";

vi.mock("@/lib/supabase/server", () => ({ createAuthenticatedSupabaseClient: vi.fn() }));
vi.mock("server-only", () => ({}));

const createClient = vi.mocked(createAuthenticatedSupabaseClient);

function setupQuery(updateData: unknown, insertData: unknown = null) {
  const readMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const readEq = vi.fn().mockReturnValue({ maybeSingle: readMaybeSingle });
  const select = vi.fn().mockReturnValue({ eq: readEq });
  const updateMaybeSingle = vi.fn().mockResolvedValue({ data: updateData, error: null });
  const updateSelect = vi.fn().mockReturnValue({ maybeSingle: updateMaybeSingle });
  const updateEq = vi.fn().mockReturnValue({ select: updateSelect });
  const update = vi.fn().mockReturnValue({ eq: updateEq });
  const insertSingle = vi.fn().mockResolvedValue({ data: insertData, error: null });
  const insertSelect = vi.fn().mockReturnValue({ single: insertSingle });
  const insert = vi.fn().mockReturnValue({ select: insertSelect });
  const from = vi.fn().mockReturnValue({ select, update, insert });
  createClient.mockResolvedValue({ from } as never);
  return { from, select, readEq, update, updateEq, insert, updateMaybeSingle };
}

describe("profile repository ownership and partial updates", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filters profile reads by the server-resolved identity", async () => {
    const q = setupQuery(null);
    const getToken = vi.fn().mockResolvedValue("session-token");
    await readProfile("user_alice", getToken);
    expect(createClient).toHaveBeenCalledWith(getToken);
    expect(q.from).toHaveBeenCalledWith("profiles");
    expect(q.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
    expect(q.readEq).toHaveBeenCalledWith("user_id", "user_alice");
  });

  it("inserts a first profile using only server-resolved ownership", async () => {
    const q = setupQuery(null, { display_name: "Alice" });
    await saveProfile("user_alice", "Alice", vi.fn());
    expect(q.update).toHaveBeenCalledWith({ display_name: "Alice" });
    expect(q.updateEq).toHaveBeenCalledWith("user_id", "user_alice");
    expect(q.insert).toHaveBeenCalledWith({ user_id: "user_alice", display_name: "Alice" });
  });

  it("updates only supplied fields and preserves omitted sections", async () => {
    const q = setupQuery({ country: "South Africa", skills: ["TypeScript"] });
    await saveProfile("user_alice", {
      personalDetails: { fullName: "Alice", country: "South Africa" },
      skills: ["TypeScript"],
    }, vi.fn());
    expect(q.update).toHaveBeenCalledWith(expect.objectContaining({
      user_id: undefined, display_name: "Alice", full_name: "Alice",
      country: "South Africa", skills: ["TypeScript"],
    }));
    expect(q.insert).not.toHaveBeenCalled();
  });
}
