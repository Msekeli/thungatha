import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "@/app/api/profile/route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/thungatha-features/authentication/server/identity";
import { readProfile, saveProfile } from "@/thungatha-features/user-profile/server/repository";

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
const request = (body: unknown) => new Request("http://local/api/profile", {
  method: "PATCH",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("Profile confirmation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({ userId: "u1", getToken: vi.fn() });
  });
  afterEach(() => vi.restoreAllMocks());


});
