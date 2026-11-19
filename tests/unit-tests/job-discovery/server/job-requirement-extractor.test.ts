import { describe, expect, it } from "vitest";
import {
  extractJobRequirements,
  hashJobDescription,
} from "@/thungatha-features/job-discovery/server/job-requirement-extractor";

describe("job requirement extraction", () => {
  it("hashes the exact source description consistently", () => {
    expect(hashJobDescription("Role description")).toBe(
      hashJobDescription("Role description"),
    );
    expect(hashJobDescription("Role description")).not.toBe(
      hashJobDescription("Changed description"),
    );
  });

  it("extracts explicit experience and its mandatory wording", () => {
    const result = extractJobRequirements(
      "Applicants must have at least 3 years of relevant experience in this role.",
      "Operations Manager",
    );
    expect(result.requirements).toContainEqual(
      expect.objectContaining({
        category: "experience",
        value: "3 years",
        importance: "mandatory",
      }),
    );
  });

  it("preserves punctuation in technical skill identifiers", () => {
    const result = extractJobRequirements(
      "Experience with C#, C++, .NET and Node.js is advantageous for this role.",
      "Software Developer",
    );
    expect(result.requirements.filter((item) => item.category === "skill").map((item) => item.value))
      .toEqual(["C#", "C++", ".NET", "Node.js"]);
    expect(result.roleFamily).toBe("software_it");
  });

  it("leaves short or unsupported descriptions unavailable", () => {
    const result = extractJobRequirements("Short text", "Unknown Role");
    expect(result.status).toBe("unavailable");
    expect(result.roleFamily).toBeNull();
    expect(result.requirements).toHaveLength(0);
  });
});
