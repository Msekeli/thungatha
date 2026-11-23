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


  it("keeps sentences in the same paragraph together so evidence retains its context", () => {
    expect(sourceSegments("<p>Build responsive interfaces. Integrate REST APIs. Maintain production features.</p>"))
      .toEqual(["Build responsive interfaces. Integrate REST APIs. Maintain production features."]);
  });

  it("keeps multi-sentence list items intact while preserving separate list items", () => {
    expect(sourceSegments("<ul><li>Build and test APIs. Diagnose integration failures.</li><li>Maintain documentation and release notes.</li></ul>"))
      .toEqual([
        "Build and test APIs. Diagnose integration failures.",
        "Maintain documentation and release notes.",
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
