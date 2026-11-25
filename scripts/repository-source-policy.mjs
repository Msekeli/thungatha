import path from "node:path";

const sourceExtensions = /\.(?:[cm]?[jt]sx?|css|scss|sass|less|json)$/i;

export function countPhysicalLines(content) {
  if (!content) return 0;
  const lines = content.split(/\r?\n/);
  return lines.at(-1) === "" ? lines.length - 1 : lines.length;
}

export function validateLineCount(filePath, current, previous = null) {
  const generated = filePath === "src/styles/tokens.css" ||
    /(?:^|\/)(?:package-lock|.*\.generated)\./.test(filePath);
  if (!sourceExtensions.test(filePath) || generated) return [];
  const count = countPhysicalLines(current);
  if (count > 100) {
    const prior = previous === null ? 0 : countPhysicalLines(previous);
    if (prior > 100 && count < prior) {
      return [{
        level: "warning",
        message: filePath + " reduced from " + prior + " to " + count +
          " lines; legacy debt remains",
      }];
    }
    return [{
      level: "error",
      message: filePath + " has " + count + " lines; maximum is 100",
    }];
  }
  if (count >= 80) {
    return [{
      level: "warning",
      message: filePath + " has " + count +
        " lines; refactor before it exceeds 100",
    }];
  }
  return [];
}

export function validateImportBoundaries(filePath, source) {
  if (!/\.(?:tsx?|jsx?|mts|mjs)$/.test(filePath) ||
    filePath.startsWith("tests/")) return [];
  const owner = filePath.match(
    /^src\/thungatha-features\/([^/]+)\//,
  )?.[1] ?? null;
  const isGlobal = filePath.startsWith("src/components/");
  if (!owner && !isGlobal) return [];
  const violations = [];
  const imports = source.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g);
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
    value => "private feature UI import is not allowed: " + value,
  );
}
