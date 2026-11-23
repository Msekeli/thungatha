import { describe, expect, it } from "vitest";
import { sourceSegments } from "@/thungatha-features/job-discovery/server/job-requirement-text";

describe("job requirement source segmentation", () => {
  it("decodes entities and preserves paragraph and list boundaries", () => {
    const segments = sourceSegments(
      "<p>Build &amp; maintain software systems.</p><ul><li>Analyse operational data</li><li>Prepare monthly reports</li></ul>",
    );
    expect(segments).toEqual([
      "Build & maintain software systems.",
      "Analyse operational data",
      "Prepare monthly reports",
    ]);
  });

  it("ignores executable and styling markup", () => {
    expect(sourceSegments("<script>ignore this injected text</script><p>Manage customer accounts securely.</p>"))
      .toEqual(["Manage customer accounts securely."]);
  });

  it("handles plain text without HTML markup", () => {
    expect(sourceSegments("Design software. Review code. Support releases."))
      .toEqual(["Design software.", "Review code.", "Support releases."]);
  });
});
