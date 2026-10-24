import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReusablePublicFeed } from "@/thungatha-features/job-discovery/ui/job-feed-cache";
import { requestJobFeed } from "@/thungatha-features/job-discovery/ui/request-job-feed";

vi.mock("@/thungatha-features/job-discovery/ui/request-job-feed", () => ({
  requestJobFeed: vi.fn(),
}));

const job = (id: string) => ({
  id,
  title: "Engineer",
  employer_name: null,
  description: null,
  location_text: null,
  country_code: null,
  work_mode: "unknown",
  employment_type: null,
  salary_min: null,
  salary_max: null,
  salary_currency: null,
  updated_at: null,
  job_sources: [],
  state: null,
});

function cacheFeed(jobs: ReturnType<typeof job>[]) {
  sessionStorage.setItem(
    "thungatha-public-job-feed-v2",
    JSON.stringify({
      savedAt: Date.now(),
      feed: { jobs, page: 1, pageSize: 30, total: 10, totalPages: 1 },
    }),
  );
}

describe("public feed cache reconciliation", () => {
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

  it("reuses a complete page and reconciles states and the filtered total", async () => {
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

  it("fetches a complete authenticated page when a cached row was dismissed", async () => {
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
