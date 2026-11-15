import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReusablePublicFeed } from "@/thungatha-features/job-discovery/ui/job-feed-cache";
import { requestJobFeed } from "@/thungatha-features/job-discovery/ui/request-job-feed";

vi.mock("@/thungatha-features/job-discovery/ui/request-job-feed", () => ({
  requestJobFeed: vi.fn(),
}));

const job = (id: string) => ({
  id,
  scout_vacancy_id: "123e4567-e89b-42d3-a456-426614174000",
  title: "Engineer",
  employer_name: "Example Employer",
  company_logo_url: null,
  description: "<p>Build software with the team.</p>",
  location_text: "Cape Town",
  application_url: "https://careers.example.test/apply",
  published_at: null,
  source_updated_at: null,
  updated_at: "2026-11-07T10:00:00Z",
  state: null,
});

function cacheFeed(jobs: ReturnType<typeof job>[]) {
  sessionStorage.setItem(
    "thungatha-public-job-feed-v3",
    JSON.stringify({
      savedAt: Date.now(),
      feed: { jobs, page: 1, pageSize: 30, total: 10, totalPages: 1 },
    }),
  );
}

describe("Scout vacancy feed cache", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          states: [
            { job_id: "saved", state: "saved" },
            { job_id: "dismissed-outside-page", state: "dismissed" },
          ],
        }),
      }),
    );
  });

  it("reuses a complete page and reconciles user states and totals", async () => {
    cacheFeed([job("saved")]);
    vi.mocked(requestJobFeed).mockResolvedValue({
      jobs: [],
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
    const feed = await getReusablePublicFeed(new AbortController().signal);
    expect(feed?.jobs[0].state).toBe("saved");
    expect(feed?.total).toBe(8);
    expect(requestJobFeed).toHaveBeenCalledWith(
      "state=dismissed&page=1&pageSize=1&publishedWithin=any",
      expect.any(AbortSignal),
    );
  });

  it("rejects a cached page containing a dismissed Scout vacancy", async () => {
    cacheFeed([job("dismissed-outside-page")]);
    vi.mocked(requestJobFeed).mockResolvedValue({
      jobs: [],
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
    await expect(
      getReusablePublicFeed(new AbortController().signal),
    ).resolves.toBeNull();
  });
});
