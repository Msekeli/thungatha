import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import JobsDiscovery from "./jobs-discovery";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string; block?: boolean }) => <button {...props}>{children}</button>,
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

function setupFetch(jobs: unknown[] = [firstJob], options: { total?: number; detailStatus?: number; feedStatus?: number } = {}) {
  const requests: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    requests.push(url);
    if (url.startsWith("/api/jobs?")) {
      if (options.feedStatus && options.feedStatus !== 200) return response({ error: "Service unavailable" }, options.feedStatus);
      const requestUrl = new URL(url, "http://local");
      return response({ jobs, page: Number(requestUrl.searchParams.get("page") ?? "1"), pageSize: 25, total: options.total ?? jobs.length, totalPages: Math.ceil((options.total ?? jobs.length) / 25) });
    }
    if (url.startsWith("/api/jobs/")) {
      if (options.detailStatus && options.detailStatus !== 200) return response({ error: "Job not found" }, options.detailStatus);
      const selected = jobs.find((job) => (job as { id: string }).id === url.split("/").pop()) ?? firstJob;
      return response({ job: selected });
    }
    return response({}, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { requests, fetchMock };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Job Discovery", () => {
  it("renders API-provided listing fields and details", async () => {
    setupFetch();
    render(<JobsDiscovery />);
    expect(await screen.findByRole("heading", { name: "Software Engineer" })).toBeTruthy();
    expect(screen.getByText("Cape Town, South Africa")).toBeTruthy();
    expect(screen.getByText("Full-time")).toBeTruthy();
    expect(screen.getByText("Greenhouse")).toBeTruthy();
    expect(await screen.findByText("Build and support web services.")).toBeTruthy();
  });

  it("submits the exact supported search and filter query parameters", async () => {
    const { requests } = setupFetch();
    render(<JobsDiscovery />);
    await screen.findByRole("heading", { name: "Software Engineer" });
    fireEvent.change(screen.getByLabelText("Keyword or employer"), { target: { value: "engineer" } });
    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "Cape Town" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "ZA" } });
    fireEvent.change(screen.getByLabelText("Work mode"), { target: { value: "remote" } });
    fireEvent.change(screen.getByLabelText("Employment type"), { target: { value: "Full-time" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(requests.some((url) => {
      const params = new URL(url, "http://local").searchParams;
      return params.get("query") === "engineer" && params.get("location") === "Cape Town" && params.get("countryCode") === "ZA" && params.get("workMode") === "remote" && params.get("employmentType") === "Full-time";
    })).toBe(true));
  });

  it("clears filters and resets pagination", async () => {
    const { requests } = setupFetch();
    render(<JobsDiscovery />);
    await screen.findByRole("heading", { name: "Software Engineer" });
    fireEvent.change(screen.getByLabelText("Keyword or employer"), { target: { value: "engineer" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(requests.some((url) => new URL(url, "http://local").searchParams.get("query") === "engineer")).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(requests.some((url) => {
      const p = new URL(url, "http://local").searchParams;
      return !p.get("query") && p.get("page") === "1" && p.get("pageSize") === "25";
    })).toBe(true));
    expect((screen.getByLabelText("Keyword or employer") as HTMLInputElement).value).toBe("");
  });

  it("loads selected details and distinguishes original source from application destination", async () => {
    const { requests } = setupFetch([firstJob, secondJob]);
    render(<JobsDiscovery />);
    fireEvent.click(await screen.findByRole("button", { name: /Frontend Developer/ }));
    expect(await screen.findByText("APPLICATION DESTINATION")).toBeTruthy();
    expect(screen.getByRole("link", { name: /View original listing/ }).getAttribute("href")).toBe("https://jobs.example.test/role");
    expect(screen.getByRole("link", { name: /Open job application page/ }).getAttribute("href")).toBe("https://careers.example.test/apply");
    expect(requests.some((url) => url === "/api/jobs/223e4567-e89b-42d3-a456-426614174000")).toBe(true);
  });

  it("shows empty results separately from request failures", async () => {
    setupFetch([]);
    render(<JobsDiscovery />);
    expect(await screen.findByText("No active jobs are available")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a retryable feed error and recovers", async () => {
    const { fetchMock } = setupFetch([firstJob], { feedStatus: 503 });
    render(<JobsDiscovery />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.startsWith("/api/jobs?") ? response({ jobs: [firstJob], page: 1, pageSize: 25, total: 1, totalPages: 1 }) : response({ job: firstJob });
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry feed" }));
    expect(await screen.findByRole("heading", { name: "Software Engineer" })).toBeTruthy();
  });

  it("uses server paging metadata for next-page navigation", async () => {
    const { requests } = setupFetch([firstJob], { total: 30 });
    render(<JobsDiscovery />);
    await screen.findByRole("heading", { name: "Software Engineer" });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(requests.some((url) => new URL(url, "http://local").searchParams.get("page") === "2")).toBe(true));
  });

  it("renders the server-provided saved state without mutating it in C07", async () => {
    setupFetch([firstJob, secondJob]);
    render(<JobsDiscovery />);
    expect(await screen.findByText("Saved")).toBeTruthy();
  });
});
