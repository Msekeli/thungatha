import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/scout/vacancies/route";
import { scoutVacancyPayload } from "@/tests/test-support/job-discovery-api-mocks";

describe("POST /api/internal/scout/vacancies authentication and validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("SCOUT_INGESTION_SECRET", "test-scout-secret");
  });

  it("rejects requests without the Scout bearer secret", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify([scoutVacancyPayload]),
    }));
    expect(response.status).toBe(401);
  });

  it("rejects fields outside the exact receiving contract", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-scout-secret" },
      body: JSON.stringify([{ ...scoutVacancyPayload, salary: 45000 }]),
    }));
    expect(response.status).toBe(400);
  });

  it("rejects duplicate Scout IDs inside one batch", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-scout-secret" },
      body: JSON.stringify([
        scoutVacancyPayload,
        { ...scoutVacancyPayload, jobTitle: "Another role" },
      ]),
    }));
    expect(response.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-scout-secret" },
      body: "{",
    }));
    expect(response.status).toBe(400);
  });
});
