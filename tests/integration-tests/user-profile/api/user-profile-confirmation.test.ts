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

  it("confirms a partial update using the merged saved Profile", async () => {
    const getToken = vi.fn().mockResolvedValue("jwt");
    identity.mockResolvedValue({ userId: "u_complete", getToken });
    read.mockResolvedValue({
      data: {
        full_name: "Lerato", email: "l@example.com", phone: "0123456789",
        location: "Cape Town", country: "South Africa",
        residential_suburb: "Observatory", residential_city: "Cape Town",
        residential_province: "Western Cape", summary: "Experienced professional.",
        education: [{
          id: "edu-1", educationLevel: "Diploma",
          qualification: "IT", institution: "College",
        }],
      },
      error: null,
    } as never);
    save.mockResolvedValue({ data: { skills: ["React"] }, error: null } as never);
    const confirmedAt = "2026-11-20T08:00:00.000Z";

    const res = await PATCH(request({ skills: ["React"], confirmedAt }));

    expect(res.status).toBe(200);
    expect(read).toHaveBeenCalledWith("u_complete", getToken);
    expect(save).toHaveBeenCalledWith(
      "u_complete", { skills: ["React"], confirmedAt }, getToken,
    );
  });

  it("rejects confirmation when the merged saved Profile is incomplete", async () => {
    identity.mockResolvedValue({ userId: "u_incomplete", getToken: vi.fn() });
    read.mockResolvedValue({ data: { full_name: "Lerato" }, error: null } as never);

    const res = await PATCH(request({
      skills: ["React"], confirmedAt: "2026-11-20T08:00:00.000Z",
    }));

    expect(res.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});
