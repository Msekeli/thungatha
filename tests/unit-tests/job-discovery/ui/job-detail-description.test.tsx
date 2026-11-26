import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobDetailDescription } from "@/thungatha-features/job-discovery/ui/shared/job-detail-description";

describe("JobDetailDescription", () => {
  it("renders readable text from Scout's supplied HTML without exposing markup", () => {
    const description =
      "<h2>About the role</h2><p>Build and support web services with the engineering team.</p><ul><li>Use React.</li><li>Build APIs.</li></ul>";
    const { container } = render(
      <JobDetailDescription description={description} />,
    );
    const content = container.querySelector(".th-job-description-html");

    expect(
      screen.getByRole("heading", { name: "Job description" }),
    ).toBeTruthy();
    expect(content?.textContent).toContain("About the role");
    expect(content?.textContent).toContain(
      "Build and support web services with the engineering team.",
    );
    expect(content?.textContent).toContain("Use React.");
    expect(content?.textContent).toContain("Build APIs.");
    expect(content?.querySelector("h2, ul, li")).toBeNull();
  });

  it("shows a clear fallback when no description is available", () => {
    render(<JobDetailDescription description={null} />);
    expect(
      screen.getAllByText("The employer has not supplied a job description."),
    ).toHaveLength(1);
  });
});
