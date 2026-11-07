import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobDetailDescription } from "@/thungatha-features/job-discovery/ui/shared/job-detail-description";

describe("JobDetailDescription", () => {
  it("renders Scout's sanitised HTML structure without flattening it", () => {
    const description =
      "<h2>About the role</h2><p>Build and support web services with the engineering team.</p><ul><li>Use React.</li><li>Build APIs.</li></ul>";
    const { container } = render(
      <JobDetailDescription description={description} />,
    );

    expect(screen.getAllByRole("heading", { name: "About the role" })).toHaveLength(1);
    expect(container.querySelectorAll(".th-job-description-html h2")).toHaveLength(1);
    expect(container.querySelectorAll(".th-job-description-html ul")).toHaveLength(1);
    expect(container.querySelectorAll(".th-job-description-html li")).toHaveLength(2);
    expect(screen.getAllByText("Build and support web services with the engineering team.")).toHaveLength(1);
  });

  it("shows a clear fallback when no description is available", () => {
    render(<JobDetailDescription description={null} />);
    expect(
      screen.getAllByText("The employer has not supplied a job description."),
    ).toHaveLength(1);
  });
});
