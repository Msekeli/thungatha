import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/ai-matching/worker/route";
import { processJobAiQueue } from "@/thungatha-features/job-discovery/server/job-ai-worker";

vi.mock("@/thungatha-features/job-discovery/server/job-ai-worker", () => ({
  processJobAiQueue: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("AI matching worker route", () => {
  it("returns a failing HTTP status while preserving task diagnostics", async () => {
    vi.stubEnv("AI_WORKER_SECRET", "worker-secret");
    vi.mocked(processJobAiQueue).mockResolvedValue({
      claimed: 1,
      processed: 0,
      stale: 0,
      unavailable: 0,
      failed: 1,
      durationMs: 1200,
      tasks: [
        {
          taskId: "task-id",
          jobId: "job-id",
          outcome: "failed",
          attempts: 2,
          error: "Gemini returned HTTP 503.",
        },
      ],
    });

    const response = await POST(
      new Request("http://localhost/api/internal/ai-matching/worker", {
        method: "POST",
        headers: { Authorization: "Bearer worker-secret" },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      failed: 1,
      tasks: [{ error: "Gemini returned HTTP 503." }],
    });
  });

  it("rejects an invalid worker secret", async () => {
    vi.stubEnv("AI_WORKER_SECRET", "worker-secret");

    const response = await POST(
      new Request("http://localhost/api/internal/ai-matching/worker", {
        method: "POST",
        headers: { Authorization: "Bearer wrong-secret" },
      }),
    );

    expect(response.status).toBe(401);
    expect(processJobAiQueue).not.toHaveBeenCalled();
  });
});
