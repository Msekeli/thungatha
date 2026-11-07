import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/scout/vacancies/route";
import { createClient } from "@supabase/supabase-js";
import { scoutVacancyPayload } from "@/tests/test-support/job-discovery-api-mocks";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

const createClientMock = vi.mocked(createClient);
const upsert = vi.fn();

describe("Scout vacancy persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("SCOUT_INGESTION_SECRET", "test-scout-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    upsert.mockResolvedValue({ error: null });
    createClientMock.mockReturnValue({
      from: vi.fn(() => ({ upsert })),
    } as never);
  });

  it("stores sanitised HTML unchanged and keeps missing dates null", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      headers: { Authorization: "Bearer test-scout-secret" },
      body: JSON.stringify([scoutVacancyPayload]),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ accepted: 1 });
    expect(upsert).toHaveBeenCalledWith(
      [expect.objectContaining({
        scout_vacancy_id: scoutVacancyPayload.scoutVacancyId,
        title: scoutVacancyPayload.jobTitle,
        employer_name: scoutVacancyPayload.companyName,
        company_logo_url: null,
        location_text: scoutVacancyPayload.location,
        description: scoutVacancyPayload.description,
        application_url: scoutVacancyPayload.applicationUrl,
        published_at: null,
        source_updated_at: null,
      })],
      { onConflict: "scout_vacancy_id" },
    );
  });
});
