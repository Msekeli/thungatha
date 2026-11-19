import { describe, expect, it } from "vitest";
import {
  extractJobRequirements,
  hashJobDescription,
} from "@/thungatha-features/job-discovery/server/job-requirement-extractor";

describe("job requirement extraction", () => {
  it("hashes the exact source description consistently", () => {
    expect(hashJobDescription("Role description")).toBe(hashJobDescription("Role description"));
    expect(hashJobDescription("Role description")).not.toBe(hashJobDescription("Changed description"));
  });

  it("extracts explicit experience and its mandatory wording", () => {
    const result = extractJobRequirements(
      "Applicants must have at least 3 years of relevant experience in this role.",
      "Operations Manager",
    );
    expect(result.requirements).toContainEqual(expect.objectContaining({
      category: "experience", value: "3 years", importance: "mandatory",
    }));
  });

  it("preserves punctuation in canonical skill identifiers", () => {
    const result = extractJobRequirements(
      "Experience with C#, C++, .NET and Node.js is advantageous for this role.",
      "Software Developer",
    );
    expect(result.requirements.filter((item) => item.category === "skill").map((item) => item.value))
      .toEqual(["C#", "C++", ".NET", "Node.js"]);
    expect(result.roleFamily).toBe("software_it");
  });

  it("does not treat incidental technology mentions as requirements", () => {
    const result = extractJobRequirements(
      "<p>Our company uses Azure and React.</p><p>Applicants must have reliable communication skills.</p>",
      "Office Administrator",
    );
    expect(result.requirements.some((item) => item.category === "skill")).toBe(false);
  });

  it("keeps bullet source evidence and preferred wording", () => {
    const result = extractJobRequirements(
      "<ul><li>Experience with Python is advantageous.</li><li>Minimum of 2 years relevant experience.</li></ul>",
      "Data Analyst",
    );
    expect(result.requirements).toContainEqual(expect.objectContaining({
      category: "skill", value: "Python", importance: "preferred",
      sourceText: "Experience with Python is advantageous.",
    }));
    expect(result.requirements).toContainEqual(expect.objectContaining({
      category: "experience", value: "2 years", importance: "mandatory",
    }));
  });

  it("deduplicates repeated canonical skill mentions", () => {
    const result = extractJobRequirements(
      "Required skills include SQL. Experience with SQL is essential.",
      "Data Analyst",
    );
    expect(result.requirements.filter((item) => item.category === "skill")).toHaveLength(1);
  });

  it("extracts a language only when a proficiency condition is explicit", () => {
    const result = extractJobRequirements(
      "Applicants must be fluent in English and isiXhosa.",
      "Support Officer",
    );
    expect(result.requirements.filter((item) => item.category === "language").map((item) => item.value))
      .toEqual(["English", "isiXhosa"]);
  });

  it("leaves short or unsupported descriptions unavailable", () => {
    const result = extractJobRequirements("Short text", "Unknown Role");
    expect(result.status).toBe("unavailable");
    expect(result.roleFamily).toBeNull();
    expect(result.requirements).toHaveLength(0);
  });
});
