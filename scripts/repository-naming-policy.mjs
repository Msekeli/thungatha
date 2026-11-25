import path from "node:path";

const frameworkFiles = new Set([
  "page", "route", "layout", "loading", "error", "global-error",
  "not-found", "template", "default", "middleware", "proxy",
  "instrumentation",
]);
const technicalFiles = new Set(["index", "schema", "types", "theme"]);
const configFiles = new Set([
  "package.json", "package-lock.json", "tsconfig.json", "next.config.ts",
  "eslint.config.mjs", "vitest.config.mts", "playwright.config.ts",
  "components.json", ".prettierrc.json", ".gitignore", ".prettierignore",
  ".env.example", "README.md", "AGENTS.md",
]);
const technicalFolders = new Set([
  "src", "app", "api", "components", "ui", "lib", "styles", "theme",
  "tests", "scripts", "public", "docs", "supabase", "milestones",
  "layout", "server", "client", "shared", "data", "hooks", "types",
  "providers", "schemas", "unit-tests", "integration-tests",
  "end-to-end-tests", "test-support",
]);

export function validateNewPath(filePath, kind = "file") {
  const name = path.posix.basename(filePath);
  if (kind === "file" && configFiles.has(name)) return [];
  const routeFolder = /^\([^/]+\)$/.test(name) ||
    /^\[{1,2}\.\.\..+\]{1,2}$/.test(name) ||
    /^\[[^/]+\]$/.test(name) ||
    /^@[a-z0-9-]+$/.test(name) ||
    /^_[a-z0-9-]+$/.test(name);
  if (kind === "directory" && (technicalFolders.has(name) || routeFolder)) return [];
  if (kind === "file" && /\.(?:test|spec)\.[^.]+$/.test(name)) {
    return validateStem(name.replace(/\.(?:test|spec)\.[^.]+$/, ""));
  }
  if (kind === "file") {
    const stem = name.replace(
      /\.(?:module\.)?[cm]?[jt]sx?$|\.css$|\.scss$|\.sass$|\.less$|\.json$/i,
      "",
    );
    if (frameworkFiles.has(stem) || technicalFiles.has(stem)) return [];
    return validateStem(stem);
  }
  return validateStem(name);
}

function validateStem(stem) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stem)) {
    return ["use lowercase kebab-case"];
  }
  const count = stem.split("-").length;
  if (count > 3) return ["use no more than three words"];
  if (count === 1) {
    return ["one-word names require an established framework or technical convention"];
  }
  return [];
}
