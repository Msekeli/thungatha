import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/test-support/vitest-setup.ts"],
    include: ["tests/unit-tests/**/*.test.{ts,tsx}", "tests/integration-tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "server-only": path.resolve(
        import.meta.dirname,
        "./tests/test-support/server-only-mock.ts",
      ),
    },
  },
});
