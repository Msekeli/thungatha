import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PublicJobOpportunityCard } from "@/thungatha-features/job-discovery/ui/public/public-job-opportunity-card";

const job = {
  id: "job-1",
  title: "Software Engineer",
  employer_name: "Example Employer",
  location_text: "Cape Town",
  work_mode: "hybrid",
  employment_type: "full_time",
};

afterEach(() => cleanup());

describe("PublicJobOpportunityCard job age", () => {
  it("shows the job age with green styling for jobs posted within three days", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={3}
        postedLabel="3 days ago"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("3 days ago")).toBeTruthy();
    expect(screen.getByText("3 days ago").className).toContain("text-success");
  });

  it("keeps the age visible in neutral styling for older jobs", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={4}
        postedLabel="4 days ago"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("4 days ago")).toBeTruthy();
    expect(screen.getByText("4 days ago").className).toContain("text-public-muted");
    expect(screen.getByText("4 days ago").className).not.toContain("text-success");
  });

  it("does not show an age indicator when the publication date is unknown", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={null}
        postedLabel="Date unknown"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Date unknown")).toBeTruthy();
  });
});
