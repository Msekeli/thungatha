import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicJobOpportunityCard } from "@/thungatha-features/job-discovery/ui/public/public-job-opportunity-card";

const job = {
  id: "job-1",
  title: "Software Engineer",
  employer_name: "Example Employer",
  location_text: "Cape Town",
  work_mode: "hybrid",
  employment_type: "full_time",
};

describe("PublicJobOpportunityCard freshness indicator", () => {
  it("shows the green NEW indicator for jobs posted within three days", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={3}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("NEW")).toBeTruthy();
  });

  it("does not show an age indicator for older jobs", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={4}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText("NEW")).toBeNull();
    expect(screen.queryByText(/days ago/)).toBeNull();
  });

  it("does not show an age indicator when the publication date is unknown", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText("NEW")).toBeNull();
    expect(screen.queryByText(/Date unknown/)).toBeNull();
  });
});
