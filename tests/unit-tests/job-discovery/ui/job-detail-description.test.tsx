import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobDetailDescription } from "@/thungatha-features/job-discovery/ui/shared/job-detail-description";

describe("JobDetailDescription", () => {
  it("labels provider snippets as previews and preserves all supplied text", () => {
    const description = `${"A complete source paragraph.\n".repeat(40)}Final source line.`;
    const { container } = render(
      <JobDetailDescription
        description={description}
        descriptionIsPreview
      />,
    );

    expect(screen.getAllByText("Description preview")).toHaveLength(2);
    expect(
      screen.getAllByText(/This source provides a preview/),
    ).toHaveLength(2);
    const renderedDescriptions = container.querySelectorAll(".whitespace-pre-wrap");
    expect([...renderedDescriptions].map((node) => node.textContent)).toEqual([
      description,
      description,
    ]);
  });

  it("keeps the missing-description fallback when the source supplies no text", () => {
    render(<JobDetailDescription description={null} />);
    expect(
      screen.getAllByText(/A full job description has not been supplied/),
    ).toHaveLength(2);
  });
});
