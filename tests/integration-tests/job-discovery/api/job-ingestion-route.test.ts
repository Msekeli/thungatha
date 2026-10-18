import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/jobs/ingest/route";
import { ingestJobs } from "@/lib/jobs/ingestion";

vi.mock("@/lib/jobs/ingestion", () => ({ ingestJobs: vi.fn() }));

const ingest = vi.mocked(ingestJobs);

describe("POST /api/internal/jobs/ingest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.INGESTION_CRON_SECRET = "test-ingestion-secret";
    delete process.env.CRON_SECRET;
  });

  it("rejects requests without the bearer secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/jobs/ingest", {
        method: "POST",
      }),
    );
    expect(response.status).toBe(401);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("returns 503 when no ingestion secret is configured", async () => {
    delete process.env.INGESTION_CRON_SECRET;
    delete process.env.CRON_SECRET;
    const response = await POST(
      new Request("http://localhost/api/internal/jobs/ingest", {
        method: "POST",
      }),
    );
    expect(response.status).toBe(503);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("runs ingestion only after authenticating the caller", async () => {
    ingest.mockResolvedValue({
      providers: [
        {
          providerKey: "adzuna",
          status: "succeeded",
          received: 1,
          inserted: 1,
          updated: 0,
          skipped: 0,
        },
      ],
      totals: { received: 1, inserted: 1, updated: 0, skipped: 0, errors: 0 },
    });
    const response = await POST(
      new Request("http://localhost/api/internal/jobs/ingest", {
        method: "POST",
        headers: { authorization: "Bearer test-ingestion-secret" },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      totals: { inserted: 1, errors: 0 },
    });
    expect(ingest).toHaveBeenCalledOnce();
  });

  it("reports partial provider failures without hiding the result", async () => {
    ingest.mockResolvedValue({
      providers: [
        {
          providerKey: "jooble",
          status: "failed",
          received: 0,
          inserted: 0,
          updated: 0,
          skipped: 0,
          error: "provider down",
        },
      ],
      totals: { received: 0, inserted: 0, updated: 0, skipped: 0, errors: 1 },
    });
    const response = await POST(
      new Request("http://localhost/api/internal/jobs/ingest", {
        method: "POST",
        headers: { authorization: "Bearer test-ingestion-secret" },
      }),
    );
    expect(response.status).toBe(207);
    expect(await response.json()).toMatchObject({ totals: { errors: 1 } });
  });
});
