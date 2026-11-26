import { describe, expect, it } from "vitest";
import { calculatePinchZoom } from "@/thungatha-features/cv-studio/ui/cv-pdf-pinch-zoom";

describe("calculatePinchZoom", () => {
  it("increases zoom as the pinch distance expands", () => {
    expect(calculatePinchZoom(100, 100, 140)).toBe(140);
  });

  it("decreases zoom as the pinch distance contracts", () => {
    expect(calculatePinchZoom(100, 100, 70)).toBe(70);
  });

  it("clamps zoom to the supported range", () => {
    expect(calculatePinchZoom(100, 100, 300)).toBe(200);
    expect(calculatePinchZoom(100, 100, 20)).toBe(50);
  });

  it("preserves the starting zoom for invalid distances", () => {
    expect(calculatePinchZoom(125, 0, 100)).toBe(125);
    expect(calculatePinchZoom(125, 100, 0)).toBe(125);
  });
});
