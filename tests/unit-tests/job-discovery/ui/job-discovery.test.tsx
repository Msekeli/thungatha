import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import JobsDiscovery from "@/thungatha-features/job-discovery/ui/jobs-discovery";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/jobs",
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
  Show: ({ when, children }: { when: string; children: React.ReactNode }) =>
    when === "signed-in" ? children : null,
}));

vi.mock("@/components/layout/workspace-shell", () => ({
  WorkspaceShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    block,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
    block?: boolean;
  }) => (
    <button
      {...props}
      data-variant={variant}
      data-size={size}
      data-block={block}
    >
      {children}
    </button>
  ),
  ButtonLink: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const firstJob = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  title: "Software Engineer",
  employer_name: "Example Employer",
  description: "Build and support web services.",
  location_text: "Cape Town, South Africa",
  country_code: "ZA",
  work_mode: "hybrid",
  employment_type: "Full-time",
  salary_min: 500000,
  salary_max: 650000,
  salary_currency: "ZAR",
  updated_at: "2026-10-10T10:00:00.000Z",
  job_sources: [
    {
      id: "source-1",
      provider_key: "greenhouse",
      provider_kind: "ats",
      external_job_id: "job-123",
      source_url: "https://jobs.example.test/role",
      application_url: "https://careers.example.test/apply",
      published_at: "2026-10-01T00:00:00.000Z",
      availability_status: "active",
    },
  ],
  state: null,
};
const secondJob = {
  ...firstJob,
  id: "223e4567-e89b-42d3-a456-426614174000",
  title: "Frontend Developer",
  employer_name: "Other Employer",
  state: "saved",
};

function response(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function renderAuthenticatedDiscovery() {
  return render(<JobsDiscovery configured />);
}

function setupFetch(
  jobs: unknown[] = [firstJob],
  options: {
    total?: number;
    detailStatus?: number;
    feedStatus?: number;
    feedBody?: unknown;
  } = {},
) {
  const requests: string[] = [];
  const states = new Map(
    jobs.map((job) => {
      const item = job as { id: string; state?: "saved" | "dismissed" | null };
      return [item.id, item.state ?? null] as const;
    }),
  );
  const activities = new Map<
    string,
    { application_link_opened_at: string | null; applied_at: string | null }
  >();
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requests.push(url);
      if (url.startsWith("/api/jobs?")) {
        const requestUrl = new URL(url, "http://local");
        if (requestUrl.searchParams.get("statesOnly") === "1")
          return response({
            states: [...states.entries()].map(([job_id, state]) => ({
              job_id,
              state,
            })),
          });
        if (options.feedStatus && options.feedStatus !== 200)
          return response({ error: "Service unavailable" }, options.feedStatus);
        const currentJobs = jobs.map((job) => {
          const item = job as {
            id: string;
            state?: "saved" | "dismissed" | null;
          };
          return { ...item, state: states.get(item.id) ?? null };
        });
        const stateFilter = requestUrl.searchParams.get("state") ?? "all";
        const visibleJobs = currentJobs.filter((job) => {
          if (stateFilter === "saved") return job.state === "saved";
          if (stateFilter === "dismissed") return job.state === "dismissed";
          return job.state !== "dismissed";
        });
        return response(
          options.feedBody ?? {
            jobs: visibleJobs,
            page: Number(requestUrl.searchParams.get("page") ?? "1"),
            pageSize: 30,
            total: options.total ?? visibleJobs.length,
            totalPages: Math.ceil((options.total ?? visibleJobs.length) / 30),
          },
        );
      }
      if (url.endsWith("/activity")) {
        const jobId = url.split("/").at(-2) ?? "";
        const current = activities.get(jobId) ?? {
          application_link_opened_at: null,
          applied_at: null,
        };
        if (init?.method === "POST") {
          const body = JSON.parse(String(init.body ?? "{}")) as {
            action: "opened_application" | "confirm_applied";
          };
          const next = {
            application_link_opened_at:
              body.action === "opened_application"
                ? "2026-10-17T10:00:00Z"
                : (current.application_link_opened_at ??
                  "2026-10-17T10:00:00Z"),
            applied_at:
              body.action === "confirm_applied"
                ? (current.applied_at ?? "2026-10-17T10:01:00Z")
                : current.applied_at,
          };
          activities.set(jobId, next);
          return response({ activity: next });
        }
        return response({ activity: current });
      }
      if (url.endsWith("/state")) {
        const jobId = url.split("/").at(-2) ?? "";
        if (init?.method === "PUT") {
          const body = JSON.parse(String(init.body ?? "{}")) as {
            state: "saved" | "dismissed";
          };
          states.set(jobId, body.state);
          return response({
            state: {
              job_id: jobId,
              state: body.state,
              updated_at: "2026-10-16T10:00:00Z",
            },
          });
        }
        states.set(jobId, null);
        return response({ state: null });
      }
      if (url.startsWith("/api/jobs/")) {
        if (options.detailStatus && options.detailStatus !== 200)
          return response({ error: "Job not found" }, options.detailStatus);
        const id = url.split("/").pop() ?? "";
        const selected =
          jobs.find((job) => (job as { id: string }).id === id) ?? firstJob;
        const item = selected as {
          id: string;
          state?: "saved" | "dismissed" | null;
        };
        return response({
          job: { ...item, state: states.get(item.id) ?? null },
        });
      }
      return response({}, 404);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return { requests, fetchMock };
}
beforeEach(() => {
  window.sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Job Discovery", () => {
  it("keeps details empty until a listing is explicitly selected", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    expect(
      (await screen.findAllByRole("heading", { name: "Software Engineer" }))
        .length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText("Select an opportunity")).toBeTruthy();
    expect(screen.queryByText("Build and support web services.")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /Software Engineer, Example Employer/ }),
    );
    expect(
      await screen.findAllByText("Build and support web services."),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Cape Town, South Africa").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Full-time").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Example Employer").length).toBeGreaterThan(0);
  });

  it("shows dismissed jobs and an accurate dismissed count", async () => {
    const dismissedJobs = Array.from({ length: 4 }, (_, index) => ({
      ...firstJob,
      id: `323e4567-e89b-42d3-a456-42661417400${index}`,
      title: `Dismissed role ${index + 1}`,
      state: "dismissed" as const,
    }));
    setupFetch(dismissedJobs);
    render(<JobsDiscovery configured />);
    const dismissedButton = await screen.findByRole("button", {
      name: "Dismissed (4)",
    });
    fireEvent.click(dismissedButton);
    expect(
      await screen.findByRole("button", { name: /Dismissed role 1/ }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /Dismissed role/ }).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("submits the supported search and filter query parameters", async () => {
    const { requests } = setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findAllByRole("heading", { name: "Software Engineer" });
    fireEvent.change(
      screen.getByLabelText("Search roles, skills, or companies"),
      {
        target: { value: "engineer" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.change(screen.getByLabelText("Filter by location"), {
      target: { value: "Cape Town" },
    });
    fireEvent.click(await screen.findByRole("checkbox", { name: "Remote" }));
    fireEvent.click(screen.getByRole("button", { name: /Employment type/ }));
    fireEvent.click(await screen.findByRole("option", { name: "Full-time" }));
    fireEvent.click(screen.getByRole("button", { name: /Posted within/ }));
    fireEvent.click(await screen.findByRole("option", { name: "Last 7 days" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() =>
      expect(
        requests.some((url) => {
          const params = new URL(url, "http://local").searchParams;
          return (
            params.get("query") === "engineer" &&
            params.get("location") === "Cape Town" &&
            params.get("workMode") === "remote" &&
            params.get("employmentType") === "full_time" &&
            params.get("publishedWithin") === "7d"
          );
        }),
        JSON.stringify(requests),
      ).toBe(true),
    );
  });

  it("clears filters and resets pagination", async () => {
    const { requests } = setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findAllByRole("heading", { name: "Software Engineer" });
    fireEvent.change(
      screen.getByLabelText("Search roles, skills, or companies"),
      {
        target: { value: "engineer" },
      },
    );
    fireEvent.submit(screen.getByRole("search"));
    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            new URL(url, "http://local").searchParams.get("query") ===
            "engineer",
        ),
      ).toBe(true),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.click(await screen.findByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(
        requests.some((url) => {
          const p = new URL(url, "http://local").searchParams;
          return (
            !p.get("query") &&
            p.get("publishedWithin") === "any" &&
            p.get("page") === "1" &&
            p.get("pageSize") === "30"
          );
        }),
      ).toBe(true),
    );
    expect(
      (
        screen.getByLabelText(
          "Search roles, skills, or companies",
        ) as HTMLInputElement
      ).value,
    ).toBe("");
  });

  it("loads selected details and provides a single application action", async () => {
    const { requests } = setupFetch([firstJob, secondJob]);
    render(<JobsDiscovery configured={false} />);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Frontend Developer, Other Employer, Cape Town, South Africa",
      }),
    );
    expect(
      await screen.findByText(/Application destination available/),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Apply on company site" })
        .getAttribute("title"),
    ).toContain("supplied application destination");
    expect(
      screen.getByRole("button", { name: "Apply on company site" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /View job listing/ }),
    ).toBeNull();
    expect(
      requests.some(
        (url) => url === "/api/jobs/223e4567-e89b-42d3-a456-426614174000",
      ),
    ).toBe(true);
  });

  it("does not offer application tracking when no direct application destination exists", async () => {
    const listingOnlyJob = {
      ...firstJob,
      job_sources: [{ ...firstJob.job_sources[0], application_url: null }],
    };
    setupFetch([listingOnlyJob]);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<JobsDiscovery configured={false} />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Software Engineer, Example Employer/ }),
    );
    await screen.findAllByText("Build and support web services.");
    const applyButton = await screen.findByRole("button", {
      name: "Open job listing",
    });
    expect(applyButton).toHaveAttribute(
      "title",
      expect.stringContaining("available source listing"),
    );
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("does not render unsafe non-web source or application URLs", async () => {
    const unsafeJob = {
      ...firstJob,
      description: null,
      job_sources: [
        {
          ...firstJob.job_sources[0],
          source_url: "javascript:alert(1)",
          application_url: "data:text/html,unsafe",
        },
      ],
    };
    setupFetch([unsafeJob]);
    render(<JobsDiscovery configured={false} />);
    fireEvent.click(
      await screen.findByRole("button", {
        name: /Software Engineer, Example Employer/,
      }),
    );
    expect(
      await screen.findByText(/Employer application link not verified/),
    ).toBeTruthy();
    expect(
      screen.getAllByText(
        /A full job description has not been supplied by the source/,
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Greenhouse" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Open job listing" }),
    ).toBeDisabled();
  });

  it("explains expired sessions and links back to sign-in", async () => {
    setupFetch([firstJob], { feedStatus: 401 });
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByText(/Your session has expired/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Go to sign in" }).getAttribute("href"),
    ).toBe("/sign-in");
  });

  it("rejects malformed feed metadata instead of rendering inconsistent results", async () => {
    setupFetch([firstJob], {
      feedBody: {
        jobs: [firstJob],
        page: 1,
        pageSize: 30,
        total: 30,
        totalPages: 2,
      },
    });
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/unexpected response/)).toBeTruthy();
    expect(
      screen.queryAllByRole("heading", { name: "Software Engineer" }),
    ).toHaveLength(0);
  });

  it("shows empty results separately from request failures", async () => {
    setupFetch([]);
    render(<JobsDiscovery configured={false} />);
    expect(
      await screen.findByText("No active opportunities available"),
    ).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a retryable feed error and recovers", async () => {
    const { fetchMock } = setupFetch([firstJob], { feedStatus: 503 });
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.startsWith("/api/jobs?")
        ? response({
            jobs: [firstJob],
            page: 1,
            pageSize: 30,
            total: 1,
            totalPages: 1,
          })
        : response({ job: firstJob });
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(
      (await screen.findAllByRole("heading", { name: "Software Engineer" }))
        .length,
    ).toBeGreaterThan(0);
  });

  it("uses server paging metadata for next-page navigation", async () => {
    const { requests } = setupFetch([firstJob], { total: 31 });
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private readonly callback: IntersectionObserverCallback) {}
        readonly root = null;
        readonly rootMargin = "";
        readonly thresholds: number[] = [];
        observe(target: Element) {
          this.callback(
            [{ isIntersecting: true, target } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
        }
        disconnect() {}
        unobserve() {}
        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }
      },
    );
    render(<JobsDiscovery configured={false} />);
    await screen.findAllByRole("heading", { name: "Software Engineer" });
    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            new URL(url, "http://local").searchParams.get("page") === "2",
        ),
      ).toBe(true),
    );
  });

  it("persists a saved state and can undo it", async () => {
    const { fetchMock } = setupFetch();
    renderAuthenticatedDiscovery();
    await screen.findAllByText("Build and support web services.");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("button", { name: "Undo" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/state",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ state: "saved" }),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jobs/123e4567-e89b-42d3-a456-426614174000/state",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Undo" })).toBeNull(),
    );
  });

  it("automatically removes the bottom Undo snackbar after ten seconds", async () => {
    setupFetch();
    renderAuthenticatedDiscovery();
    await screen.findAllByText("Build and support web services.");

    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
  });

  it("keeps dismissal undo available after the job leaves active results", async () => {
    const { requests, fetchMock } = setupFetch();
    renderAuthenticatedDiscovery();
    await screen.findAllByText("Build and support web services.");
    const dismissButton = screen.queryByRole("button", { name: "Dismiss" });
    expect(dismissButton, JSON.stringify(requests)).not.toBeNull();
    fireEvent.click(dismissButton!);
    expect(await screen.findByRole("button", { name: "Undo" })).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: "Software Engineer, Example Employer, Cape Town, South Africa",
        }),
      ).toBeNull(),
    );
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Undo" })).toBeNull(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/state",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ state: "dismissed" }),
      }),
    );
  });

  it("records application-link opens and asks whether the user applied when the role is revisited", async () => {
    const { fetchMock } = setupFetch([firstJob, secondJob]);
    vi.spyOn(window, "open").mockImplementation(() => null);
    renderAuthenticatedDiscovery();
    await screen.findAllByText("Build and support web services.");
    fireEvent.click(
      screen.getByRole("button", { name: "Apply on company site" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Did you apply?",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(/You opened the application page for/).parentElement,
    ).toBeTruthy();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ action: "opened_application" }),
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes, I applied" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ action: "confirm_applied" }),
        }),
      ),
    );
    expect(
      await screen.findByText("Application confirmation recorded."),
    ).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Did you apply?" }),
      ).toBeNull(),
    );
  });

  it("restores pending application reminders when revisiting a job or returning from the employer tab", async () => {
    const { fetchMock } = setupFetch([firstJob, secondJob]);
    vi.spyOn(window, "open").mockImplementation(() => null);
    renderAuthenticatedDiscovery();
    await screen.findAllByText("Build and support web services.");

    fireEvent.click(
      screen.getByRole("button", { name: "Apply on company site" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Did you apply?",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Not yet" })).toBeTruthy();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ action: "opened_application" }),
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Not yet" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Did you apply?" }),
      ).toBeNull(),
    );
    await waitFor(() =>
      expect(document.body.style.overflow).not.toBe("hidden"),
    );

    // Closing the dialog keeps the pending activity so it can be shown on revisit.
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Frontend Developer, Other Employer, Cape Town, South Africa",
      }),
    );
    expect(
      screen.queryByRole("heading", { name: "Did you apply?" }),
    ).toBeNull();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Software Engineer, Example Employer, Cape Town, South Africa",
      }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Did you apply?",
      }),
    ).toBeTruthy();

    // "No, not yet" only dismisses the current display. It does not erase the pending reminder.
    fireEvent.click(screen.getByRole("button", { name: "Not yet" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Did you apply?" }),
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Yes, I applied" }),
      ).toBeNull();
    });
    await waitFor(() =>
      expect(document.body.style.overflow).not.toBe("hidden"),
    );

    // Returning from the employer tab restores the reminder from persisted activity.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    fireEvent(document, new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(
      await screen.findByRole("heading", {
        name: "Did you apply?",
      }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
        expect.objectContaining({ cache: "no-store" }),
      ),
    );

    expect(
      screen.getByRole("button", { name: "Yes, I applied" }),
    ).toBeEnabled();
  });

  it("renders the server-provided saved state", async () => {
    setupFetch([firstJob, secondJob]);
    renderAuthenticatedDiscovery();
    expect(
      await screen.findByRole("button", { name: "Unsave Frontend Developer" }),
    ).toBeTruthy();
  });
});
