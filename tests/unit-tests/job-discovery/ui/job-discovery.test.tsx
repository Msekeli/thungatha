import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import JobsDiscovery from "@/thungatha-features/job-discovery/ui/jobs-discovery";
import { scoutVacancyRecord } from "@/tests/test-support/job-discovery-api-mocks";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/jobs",
  useSearchParams: () => new URLSearchParams(""),
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  Show: ({ when, children }: { when: string; children: React.ReactNode }) =>
    when === "signed-in" ? null : children,
}));

function setupFetch() {
  sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      jobs: [scoutVacancyRecord],
      page: 1,
      pageSize: 30,
      total: 1,
      totalPages: 1,
    }),
  })));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("Scout job discovery feed", () => {
  it("shows a Scout vacancy and keeps an unknown publication date unknown", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByRole("button", {
      name: "View Software Engineer at Example Technologies",
    })).toBeTruthy();
    expect(screen.getByText("Date unknown")).toBeTruthy();
  });

  it("uses employer initials when the optional company logo is null", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findByRole("button", {
      name: "View Software Engineer at Example Technologies",
    });
    expect(screen.getByText("ET")).toBeTruthy();
  });
});
