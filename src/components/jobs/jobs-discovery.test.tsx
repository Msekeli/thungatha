import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import JobsDiscovery from "./jobs-discovery";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant: _variant, size: _size, block: _block, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string; block?: boolean }) => <button {...props}>{children}</button>,
  ButtonLink: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
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
  job_sources: [{ id: "source-1", provider_key: "greenhouse", provider_kind: "ats", external_job_id: "job-123", source_url: "https://jobs.example.test/role", application_url: "https://careers.example.test/apply", published_at: "2026-10-01T00:00:00.000Z", availability_status: "active" }],
  state: null,
};
const secondJob = { ...firstJob, id: "223e4567-e89b-42d3-a456-426614174000", title: "Frontend Developer", employer_name: "Other Employer", state: "saved" };

function response(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function setupFetch(jobs: unknown[] = [firstJob], options: { total?: number; detailStatus?: number; feedStatus?: number; feedBody?: unknown } = {}) {
  const requests: string[] = [];
  const states = new Map(
    jobs.map((job) => {
      const item = job as { id: string; state?: "saved" | "dismissed" | null };
      return [item.id, item.state ?? null] as const;
    }),
  );
  const activities = new Map<string, { application_link_opened_at: string | null; applied_at: string | null }>();
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requests.push(url);
    if (url.startsWith("/api/jobs?")) {
      if (options.feedStatus && options.feedStatus !== 200) return response({ error: "Service unavailable" }, options.feedStatus);
      const requestUrl = new URL(url, "http://local");
      const currentJobs = jobs.map((job) => {
        const item = job as { id: string; state?: "saved" | "dismissed" | null };
        return { ...item, state: states.get(item.id) ?? null };
      });
      const stateFilter = requestUrl.searchParams.get("state") ?? "all";
      const visibleJobs = currentJobs.filter((job) => {
        if (stateFilter === "saved") return job.state === "saved";
        if (stateFilter === "dismissed") return job.state === "dismissed";
        return job.state !== "dismissed";
      });
      return response(options.feedBody ?? {
        jobs: visibleJobs,
        page: Number(requestUrl.searchParams.get("page") ?? "1"),
        pageSize: 25,
        total: options.total ?? visibleJobs.length,
        totalPages: Math.ceil((options.total ?? visibleJobs.length) / 25),
      });
    }
    if (url.endsWith("/activity")) {
      const jobId = url.split("/").at(-2) ?? "";
      const current = activities.get(jobId) ?? { application_link_opened_at: null, applied_at: null };
      if (init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}")) as { action: "opened_application" | "confirm_applied" };
        const next = {
          application_link_opened_at: body.action === "opened_application" ? "2026-10-17T10:00:00Z" : current.application_link_opened_at ?? "2026-10-17T10:00:00Z",
          applied_at: body.action === "confirm_applied" ? current.applied_at ?? "2026-10-17T10:01:00Z" : current.applied_at,
        };
        activities.set(jobId, next);
        return response({ activity: next });
      }
      return response({ activity: current });
    }
    if (url.endsWith("/state")) {
      const jobId = url.split("/").at(-2) ?? "";
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body ?? "{}")) as { state: "saved" | "dismissed" };
        states.set(jobId, body.state);
        return response({ state: { job_id: jobId, state: body.state, updated_at: "2026-10-16T10:00:00Z" } });
      }
      states.set(jobId, null);
      return response({ state: null });
    }
    if (url.startsWith("/api/jobs/")) {
      if (options.detailStatus && options.detailStatus !== 200) return response({ error: "Job not found" }, options.detailStatus);
      const id = url.split("/").pop() ?? "";
      const selected = jobs.find((job) => (job as { id: string }).id === id) ?? firstJob;
      const item = selected as { id: string; state?: "saved" | "dismissed" | null };
      return response({ job: { ...item, state: states.get(item.id) ?? null } });
    }
    return response({}, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { requests, fetchMock };
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Job Discovery", () => {
  it("renders API-provided listing fields and details", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    expect((await screen.findAllByRole("heading", { name: "Software Engineer" })).length).toBeGreaterThan(0);
    expect(screen.getByText("Cape Town, South Africa")).toBeTruthy();
    expect(screen.getAllByText("Full-time").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Greenhouse").length).toBeGreaterThan(0);
    expect(await screen.findByText("Build and support web services.")).toBeTruthy();
  });

  it("submits the supported search and filter query parameters", async () => {
    const { requests } = setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findAllByRole("heading", { name: "Software Engineer" });
    fireEvent.change(screen.getByLabelText("Keyword or employer"), { target: { value: "engineer" } });
    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "Cape Town" } });
    fireEvent.change(screen.getByLabelText("Work mode"), { target: { value: "remote" } });
    fireEvent.change(screen.getByLabelText("Employment type"), { target: { value: "Full-time" } });
    fireEvent.change(screen.getByLabelText("Posted within"), { target: { value: "7d" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(requests.some((url) => {
      const params = new URL(url, "http://local").searchParams;
      return params.get("query") === "engineer" && params.get("location") === "Cape Town" && params.get("workMode") === "remote" && params.get("employmentType") === "Full-time" && params.get("publishedWithin") === "7d";
    })).toBe(true));
  });

  it("clears filters and resets pagination", async () => {
    const { requests } = setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findAllByRole("heading", { name: "Software Engineer" });
    fireEvent.change(screen.getByLabelText("Keyword or employer"), { target: { value: "engineer" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(requests.some((url) => new URL(url, "http://local").searchParams.get("query") === "engineer")).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(requests.some((url) => {
      const p = new URL(url, "http://local").searchParams;
      return !p.get("query") && p.get("publishedWithin") === "30d" && p.get("page") === "1" && p.get("pageSize") === "25";
    })).toBe(true));
    expect((screen.getByLabelText("Keyword or employer") as HTMLInputElement).value).toBe("");
  });

  it("loads selected details and provides a single application action", async () => {
    const { requests } = setupFetch([firstJob, secondJob]);
    render(<JobsDiscovery configured={false} />);
    fireEvent.click(await screen.findByRole("button", { name: /Frontend Developer/ }));
    expect(await screen.findByText(/Application page available/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Greenhouse" }).getAttribute("href")).toBe("https://jobs.example.test/role");
    expect(screen.getByRole("button", { name: "↗ Apply" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /View job listing/ })).toBeNull();
    expect(requests.some((url) => url === "/api/jobs/223e4567-e89b-42d3-a456-426614174000")).toBe(true);
  });

  it("keeps Apply enabled and opens the source listing when no dedicated application URL exists", async () => {
    const listingOnlyJob = {
      ...firstJob,
      job_sources: [{ ...firstJob.job_sources[0], application_url: null }],
    };
    setupFetch([listingOnlyJob]);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<JobsDiscovery configured={false} />);
    await screen.findByText("Build and support web services.");
    const applyButton = await screen.findByRole("button", { name: "↗ Apply" });
    expect(applyButton).not.toBeDisabled();
    fireEvent.click(applyButton);
    expect(openSpy).toHaveBeenCalledWith("https://jobs.example.test/role", "_blank", "noopener,noreferrer");
  });

  it("does not render unsafe non-web source or application URLs", async () => {
    const unsafeJob = {
      ...firstJob,
      job_sources: [{
        ...firstJob.job_sources[0],
        source_url: "javascript:alert(1)",
        application_url: "data:text/html,unsafe",
      }],
    };
    setupFetch([unsafeJob]);
    render(<JobsDiscovery configured={false} />);
    fireEvent.click(await screen.findByRole("button", { name: /Software Engineer, Example Employer/ }));
    expect(await screen.findByText(/Source link unavailable/)).toBeTruthy();
    expect(screen.getByText(/Application link not supplied/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Greenhouse" })).toBeNull();
    expect(screen.getByRole("button", { name: "↗ Apply" })).toBeDisabled();
  });

  it("explains expired sessions and links back to sign-in", async () => {
    setupFetch([firstJob], { feedStatus: 401 });
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByText(/Your session has expired/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to sign in" }).getAttribute("href")).toBe("/sign-in");
  });

  it("rejects malformed feed metadata instead of rendering inconsistent results", async () => {
    setupFetch([firstJob], { feedBody: { jobs: [firstJob], page: 1, pageSize: 25, total: 30, totalPages: 1 } });
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/unexpected response/)).toBeTruthy();
    expect(screen.queryAllByRole("heading", { name: "Software Engineer" })).toHaveLength(0);
  });

  it("shows empty results separately from request failures", async () => {
    setupFetch([]);
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByText("No active jobs are available")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a retryable feed error and recovers", async () => {
    const { fetchMock } = setupFetch([firstJob], { feedStatus: 503 });
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.startsWith("/api/jobs?") ? response({ jobs: [firstJob], page: 1, pageSize: 25, total: 1, totalPages: 1 }) : response({ job: firstJob });
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry feed" }));
    expect((await screen.findAllByRole("heading", { name: "Software Engineer" })).length).toBeGreaterThan(0);
  });

  it("uses server paging metadata for next-page navigation", async () => {
    const { requests } = setupFetch([firstJob], { total: 30 });
    render(<JobsDiscovery configured={false} />);
    await screen.findAllByRole("heading", { name: "Software Engineer" });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(requests.some((url) => new URL(url, "http://local").searchParams.get("page") === "2")).toBe(true));
  });

  it("persists a saved state and can undo it", async () => {
    const { fetchMock } = setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findByText("Build and support web services.");
    fireEvent.click(screen.getByRole("button", { name: "♧ Save" }));
    expect(await screen.findByRole("button", { name: "Undo" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/state",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ state: "saved" }) }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/state",
      expect.objectContaining({ method: "DELETE" }),
    ));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Undo" })).toBeNull());
  });

  it("automatically removes the bottom Undo snackbar after ten seconds", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findByText("Build and support web services.");

    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "♧ Save" }));
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

  it("keeps dismissal undo available when changing feed categories", async () => {
    setupFetch();
    render(<JobsDiscovery configured={false} />);
    await screen.findByText("Build and support web services.");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss job" }));
    expect(await screen.findByRole("button", { name: "Undo" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    expect(await screen.findByRole("button", { name: "Undo" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Undo" })).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(await screen.findByRole("button", { name: "Dismiss job" })).toBeTruthy();
  });

  it("records application-link opens and asks whether the user applied when the role is revisited", async () => {
    const { fetchMock } = setupFetch([firstJob, secondJob]);
    vi.spyOn(window, "open").mockImplementation(() => null);
    render(<JobsDiscovery configured={false} />);
    await screen.findByText("Build and support web services.");
    fireEvent.click(screen.getByRole("button", { name: "↗ Apply" }));
    expect(await screen.findByRole("heading", { name: "Did you apply for this role?" })).toBeTruthy();
    expect(screen.getByText(/Software Engineer at Example Employer/)).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ action: "opened_application" }) }),
    ));
    fireEvent.click(screen.getByRole("button", { name: "Yes, I applied" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ action: "confirm_applied" }) }),
    ));
    expect(await screen.findByRole("button", { name: "✓ Applied" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Did you apply for this role?" })).toBeNull();
  });

  it("restores pending application reminders when revisiting a job or returning from the employer tab", async () => {
    const { fetchMock } = setupFetch([firstJob, secondJob]);
    vi.spyOn(window, "open").mockImplementation(() => null);
    render(<JobsDiscovery configured={false} />);
    await screen.findByText("Build and support web services.");

    fireEvent.click(screen.getByRole("button", { name: "↗ Apply" }));
    expect(await screen.findByRole("heading", { name: "Did you apply for this role?" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dismiss job" })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ action: "opened_application" }) }),
    ));

    // Switching roles hides this job's popover, but does not clear its persisted pending state.
    fireEvent.click(await screen.findByRole("button", { name: /Frontend Developer/ }));
    expect(screen.queryByRole("heading", { name: "Did you apply for this role?" })).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: /Software Engineer, Example Employer/ }));
    expect(await screen.findByRole("heading", { name: "Did you apply for this role?" })).toBeTruthy();

    // "No, not yet" only dismisses the current display. It does not erase the pending reminder.
    fireEvent.click(screen.getByRole("button", { name: "No, not yet" }));
    expect(screen.queryByRole("heading", { name: "Did you apply for this role?" })).toBeNull();
    expect(screen.queryByRole("button", { name: "✓ Applied" })).toBeNull();

    // Returning from the employer tab restores the reminder from persisted activity.
    fireEvent(window, new Event("focus"));
    expect(await screen.findByRole("heading", { name: "Did you apply for this role?" })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/123e4567-e89b-42d3-a456-426614174000/activity",
      expect.objectContaining({ cache: "no-store" }),
    ));

    // The popover is non-blocking: unrelated job actions remain available.
    fireEvent.click(await screen.findByRole("button", { name: /Frontend Developer/ }));
    expect(screen.queryByRole("heading", { name: "Did you apply for this role?" })).toBeNull();
    expect(screen.getByRole("button", { name: "♧ Save" })).not.toBeDisabled();
  });

  it("renders the server-provided saved state", async () => {
    setupFetch([firstJob, secondJob]);
    render(<JobsDiscovery configured={false} />);
    expect(await screen.findByText("Saved")).toBeTruthy();
  });
});
