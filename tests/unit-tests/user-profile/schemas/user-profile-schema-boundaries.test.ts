import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/thungatha-features/user-profile/server/user-profile-schema";

describe("profile schema compatibility and boundaries", () => {
  it("accepts a legacy displayName-only payload", () => {
    expect(updateProfileSchema.safeParse({ displayName: "Lerato" }).success).toBe(true);
  });

  it("accepts an optional custom target role", () => {
    expect(updateProfileSchema.safeParse({ nextRole: "Platform Engineer" }).success).toBe(true);
  });

  it("rejects client-supplied identity fields", () => {
    expect(updateProfileSchema.safeParse({
      displayName: "Lerato",
      userId: "user_injected",
    }).success).toBe(false);
  });
});
