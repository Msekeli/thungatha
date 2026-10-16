import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Route handlers run without Next's request async context in unit tests.
// Keep connection() as a no-op in tests; production still defers to request time.
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, connection: vi.fn().mockResolvedValue(undefined) };
});
