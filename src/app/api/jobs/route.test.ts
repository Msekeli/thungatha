import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { GET } from "./route";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { searchJobs } from "@/lib/jobs/search";

vi.mock("@/lib/auth/identity", () => ({
  getAuthenticatedIdentity: vi.fn(),
  hasClerkConfiguration: vi.fn(),
}));

vi.mock("@/lib/jobs/search", () => ({
  searchJobs: vi.fn(),
}));

const identity = vi.mocked(getAuthenticatedIdentity);
const configured = vi.mocked(hasClerkConfiguration);
const search = vi.mocked(searchJobs);

function createRequest(url = "http://localhost/api/jobs") {
  return new Request(url);
}

describe("GET /api/jobs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configured.mockReturnValue(true);
    identity.mockResolvedValue({
      userId: "user_alice",
      getToken: vi.fn(),
    });
  });

  it("returns 503 when Clerk is not configured", async () => {
    configured.mockReturnValue(false);

    const response = await GET(createRequest());

    expect(response.status).toBe(503);
    expect(identity).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
  });

  it("returns 401 when no authenticated identity exists", async () => {
    identity.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    expect(search).not.toHaveBeenCalled();
  });

  it("returns 503 when identity verification fails", async () => {
    const logSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    identity.mockRejectedValue(new Error("Sensitive internal detail"));

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Authentication could not be verified");
    expect(JSON.stringify(body)).not.toContain("Sensitive internal detail");
    expect(logSpy).toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
  });

  it("passes valid query parameters to job search", async () => {
    search.mockResolvedValue([]);

    const response = await GET(
      createRequest(
        "http://localhost/api/jobs?query=software%20engineer&location=Cape%20Town&countryCode=ZA&page=2&pageSize=10",
      ),
    );

    expect(response.status).toBe(200);
    expect(search).toHaveBeenCalledWith({
      query: "software engineer",
      location: "Cape Town",
      countryCode: "ZA",
      page: 2,
      pageSize: 10,
    });

    await expect(response.json()).resolves.toEqual({
      jobs: [],
      count: 0,
    });
  });

  it("passes omitted search and pagination parameters as undefined", async () => {
    search.mockResolvedValue([]);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(search).toHaveBeenCalledWith({
      query: undefined,
      location: undefined,
      countryCode: undefined,
    });
  });

  it("returns 400 for invalid search parameters", async () => {
    search.mockRejectedValue(new ZodError([]));

    const response = await GET(
      createRequest("http://localhost/api/jobs?page=invalid"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid job search parameters",
    });
  });

  it("returns 503 when no providers are configured", async () => {
    search.mockRejectedValue(new Error("No job providers are configured."));

    const response = await GET(createRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Job search is temporarily unavailable",
    });
  });

  it("returns 503 when all configured providers fail", async () => {
    search.mockRejectedValue(new Error("All configured job providers failed."));

    const response = await GET(createRequest());

    expect(response.status).toBe(503);
  });

  it("does not expose unexpected internal errors", async () => {
    const logSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    search.mockRejectedValue(new Error("Internal provider credentials leaked"));

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(JSON.stringify(body)).not.toContain(
      "Internal provider credentials leaked",
    );
    expect(logSpy).toHaveBeenCalled();
  });
});
