import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PublicJobOpportunityCard } from "@/thungatha-features/job-discovery/ui/public/public-job-opportunity-card";

const job = {
  id: "job-1",
  title: "Software Engineer",
  employer_name: "Example Employer",
  company_logo_url: null,
  location_text: "Cape Town",
};

afterEach(() => cleanup());

describe("PublicJobOpportunityCard publication date", () => {
  it("uses the recent style for vacancies published within three days", () => {
    render(<PublicJobOpportunityCard job={job} ageDays={3} postedLabel="3 days ago" onSelect={vi.fn()} />);
    expect(screen.getByText("3 days ago").className).toContain("text-success");
  });

  it("uses neutral styling for older vacancies", () => {
    render(<PublicJobOpportunityCard job={job} ageDays={4} postedLabel="4 days ago" onSelect={vi.fn()} />);
    expect(screen.getByText("4 days ago").className).toContain("text-public-muted");
    expect(screen.getByText("4 days ago").className).not.toContain("text-success");
  });

  it("shows an unknown publication date without falling back to collection time", () => {
    render(<PublicJobOpportunityCard job={job} ageDays={null} postedLabel="Date unknown" onSelect={vi.fn()} />);
    expect(screen.getByText("Date unknown")).toBeTruthy();
  });
});
