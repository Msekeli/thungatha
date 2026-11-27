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
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={3}
        postedLabel="3 days ago"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("3 days ago").dataset.age).toBe("new");
  });

  it("uses neutral styling for older vacancies", () => {
    render(
      <PublicJobOpportunityCard
        job={job}
        ageDays={4}
        postedLabel="4 days ago"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("4 days ago").dataset.age).toBe("older");
  });

  it("shows an unknown publication date without falling back to collection time", () => {
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

  it("shows a relevant badge beside the location in the metadata row", () => {
    render(
      <PublicJobOpportunityCard
        job={{ ...job, matchClassification: "relevant" }}
        ageDays={1}
        postedLabel="Today"
        onSelect={vi.fn()}
      />,
    );
    const location = screen.getByText("Cape Town");
    const badge = screen.getByText("Relevant");
    expect(location.closest(".th-job-card__metadata")).toBe(
      badge.closest(".th-job-card__metadata"),
    );
  });

  it("does not show a badge for unclassified jobs", () => {
    render(
      <PublicJobOpportunityCard
        job={{ ...job, matchClassification: "unclassified" }}
        ageDays={1}
        postedLabel="Today"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("Relevant")).toBeNull();
    expect(screen.queryByText("Partially relevant")).toBeNull();
  });
});
