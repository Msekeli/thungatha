import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

const vacancy = {
  ...scoutVacancyRecord,
  description:
    "<h2>About the role</h2><p>Build and support web services with the engineering team.</p><ul><li>Use React.</li><li>Build APIs.</li></ul>",
};

function setupFetch() {
  sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => ({
    ok: true,
    status: 200,
    json: async () => String(input).includes(vacancy.id)
      ? { job: vacancy }
      : { jobs: [vacancy], page: 1, pageSize: 30, total: 1, totalPages: 1 },
  })));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("Scout job description detail", () => {
  it("renders the sanitised HTML headings, paragraphs and lists without flattening them", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    fireEvent.click(await screen.findByRole("button", {
      name: "View Software Engineer at Example Technologies",
    }));

    expect(await screen.findAllByRole("heading", { name: "About the role" })).toHaveLength(1);
    expect(screen.getAllByText("Build and support web services with the engineering team.")).toHaveLength(1);
    expect(screen.getAllByText("Use React.")).toHaveLength(1);
    expect(screen.getAllByText("Build APIs.")).toHaveLength(1);
  });
});
