import { describe, expect, it } from "vitest";
import {
  countPhysicalLines,
  validateLineCount,
} from "../../../scripts/repository-policy.mjs";

describe("source file size policy", () => {
  it("counts physical lines including blank lines", () => {
    expect(countPhysicalLines("one\n\nthree\n")).toBe(3);
  });

  it("warns at 80 lines and fails above 100", () => {
    const eighty = Array(80).fill("x").join("\n");
    const hundred = Array(100).fill("x").join("\n");
    const hundredOne = Array(101).fill("x").join("\n");
    expect(validateLineCount("src/example.ts", eighty)[0].level).toBe(
      "warning",
    );
    expect(validateLineCount("src/example.ts", hundred)).toEqual([]);
    expect(validateLineCount("src/example.ts", hundredOne)[0].level).toBe(
      "error",
    );
  });

  it("allows an oversized legacy file only when the change reduces it", () => {
    const before = Array(120).fill("x").join("\n");
    const reduced = Array(115).fill("x").join("\n");
    const increased = Array(125).fill("x").join("\n");
    expect(validateLineCount("src/example.ts", reduced, before)[0].level).toBe(
      "warning",
    );
    expect(
      validateLineCount("src/example.ts", increased, before)[0].level,
    ).toBe("error");
  });

  it("excludes generated token CSS from the source size limit", () => {
    const generated = Array(500).fill("x").join("\n");
    expect(validateLineCount("src/styles/tokens.css", generated)).toEqual([]);
  });
});
