import path from "node:path";

export function validateImportBoundaries(filePath, source) {
  if (
    !/\.(?:tsx?|jsx?|mts|mjs)$/.test(filePath) ||
    filePath.startsWith("tests/")
  ) {
    return [];
  }
  const owner =
    filePath.match(/^src\/thungatha-features\/([^/]+)\//)?.[1] ?? null;
  const isGlobal = filePath.startsWith("src/components/");
  if (!owner && !isGlobal) return [];
  const violations = [];
  const imports = source.matchAll(
    /(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)["']([^"']+)["']/g,
  );
  for (const match of imports) {
    const specifier = match[1];
    const target = specifier.startsWith("@/")
      ? "src/" + specifier.slice(2)
      : specifier.startsWith(".")
        ? path.posix.normalize(
            path.posix.join(path.posix.dirname(filePath), specifier),
          )
        : "";
    const featureTarget = target.match(
      /^src\/thungatha-features\/([^/]+)\/ui(?:\/|$)/,
    );
    if (!featureTarget) continue;
    if (isGlobal || (owner && owner !== featureTarget[1])) {
      violations.push(specifier);
    }
  }
  return violations.map(
    (value) => "private feature UI import is not allowed: " + value,
  );
}
