import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { JobOpportunityCard } from "@/thungatha-features/job-discovery/ui/shared/job-opportunity-card";

const job = {
  id: "job-1",
  title: "Software Engineer",
  employer_name: "Example Employer",
  company_logo_url: null,
  location_text: "Cape Town",
};

afterEach(() => cleanup());

describe("JobOpportunityCard relevance metadata", () => {
  it("shows a partially relevant badge beside the location", () => {
    render(
      <JobOpportunityCard
        job={{ ...job, matchClassification: "partially_relevant" }}
        selected={false}
        postedLabel="Today"
        onSelect={vi.fn()}
      />,
    );

    const location = screen.getByText("Cape Town");
    const badge = screen.getByText("Partially relevant");
    expect(location.closest(".th-job-card__metadata")).toBe(
      badge.closest(".th-job-card__metadata"),
    );
  });

  it("does not show a relevance badge for unclassified jobs", () => {
    render(
      <JobOpportunityCard
        job={{ ...job, matchClassification: "unclassified" }}
        selected={false}
        postedLabel="Today"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText("Relevant")).toBeNull();
    expect(screen.queryByText("Partially relevant")).toBeNull();
  });
});
