import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/scout/vacancies/route";
import { createClient } from "@supabase/supabase-js";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);
const vacancy = {
  scoutVacancyId: "123e4567-e89b-42d3-a456-426614174000",
  jobTitle: "Software Engineer",
  companyName: "Example Technologies",
  companyLogoUrl: null,
  location: "Cape Town, South Africa",
  description:
    "<h2>About the role</h2>\n<p>Build and maintain software applications with the engineering team.</p>\n<ul><li>Use React and TypeScript.</li></ul>",
  applicationUrl: "https://careers.example.test/jobs/123",
  publishedAt: null,
  updatedAt: null,
};

describe("POST /api/internal/scout/vacancies", () => {
  const upsert = vi.fn();

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

  it("rejects requests without the Scout bearer secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/scout/vacancies", {
        method: "POST",
        body: JSON.stringify([vacancy]),
      }),
    );
    expect(response.status).toBe(401);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("validates the exact Scout contract before writing", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/scout/vacancies", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-scout-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ ...vacancy, salary: 45000 }]),
      }),
    );
    expect(response.status).toBe(400);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("stores Scout's sanitised HTML unchanged and preserves null dates", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/scout/vacancies", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-scout-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([vacancy]),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ accepted: 1 });
    expect(upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          scout_vacancy_id: vacancy.scoutVacancyId,
          title: vacancy.jobTitle,
          employer_name: vacancy.companyName,
          company_logo_url: null,
          location_text: vacancy.location,
          description: vacancy.description,
          application_url: vacancy.applicationUrl,
          published_at: null,
          source_updated_at: null,
        }),
      ],
      { onConflict: "scout_vacancy_id" },
    );
  });

  it("rejects duplicate Scout IDs in one batch", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/scout/vacancies", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-scout-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([vacancy, { ...vacancy, jobTitle: "Another Role" }]),
      }),
    );
    expect(response.status).toBe(400);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
