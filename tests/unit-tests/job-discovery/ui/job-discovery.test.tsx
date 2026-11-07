import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import JobsDiscovery from "@/thungatha-features/job-discovery/ui/jobs-discovery";

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

vi.mock("@/components/layout/workspace-shell", () => ({
  WorkspaceShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const vacancy = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  scout_vacancy_id: "123e4567-e89b-42d3-a456-426614174001",
  title: "Software Engineer",
  employer_name: "Example Employer",
  company_logo_url: null,
  description:
    "<h2>About the role</h2><p>Build and support web services with the engineering team.</p><ul><li>Use React.</li><li>Build APIs.</li></ul>",
  location_text: "Cape Town, South Africa",
  application_url: "https://careers.example.test/apply",
  published_at: null,
  source_updated_at: null,
  updated_at: "2026-11-07T10:00:00.000Z",
  state: null,
};

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function setupFetch() {
  sessionStorage.clear();
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith("/api/jobs?")) {
      return response({
        jobs: [vacancy],
        page: 1,
        pageSize: 30,
        total: 1,
        totalPages: 1,
      });
    }
    if (url === `/api/jobs/${vacancy.id}`) {
      return response({ job: vacancy });
    }
    return response({ error: "Not found" }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("Scout-backed job discovery", () => {
  it("shows a Scout vacancy and does not invent a publication date", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);

    expect(
      await screen.findByRole("button", {
        name: "View Software Engineer at Example Employer",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Date unknown")).toBeTruthy();
  });

  it("renders the employer-sanitised HTML structure in the job details", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "View Software Engineer at Example Employer",
      }),
    );

    expect(await screen.findByRole("heading", { name: "About the role" })).toBeTruthy();
    expect(screen.getByText("Build and support web services with the engineering team.")).toBeTruthy();
    expect(screen.getByText("Use React.")).toBeTruthy();
    expect(screen.getByText("Build APIs.")).toBeTruthy();
  });

  it("uses employer initials when Scout has no company logo", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findByRole("button", {
      name: "View Software Engineer at Example Employer",
    });

    expect(screen.getByText("EE")).toBeTruthy();
  });
});
