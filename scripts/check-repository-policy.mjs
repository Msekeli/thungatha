import { readFileSync } from "node:fs";
import {
  validateCssApproval,
  validateImportBoundaries,
  validateLineCount,
  validateNewPath,
} from "./repository-policy.mjs";
import { fileAt, git, treeDirectories } from "./repository-git.mjs";

function report(errors, warnings) {
  warnings.forEach((message) => console.warn("WARN: " + message));
  errors.forEach((message) => console.error("ERROR: " + message));
  console.log(
    "Repository policy: " +
      errors.length +
      " error(s), " +
      warnings.length +
      " warning(s).",
  );
  if (errors.length) process.exitCode = 1;
}

const args = process.argv.slice(2);
const base = args[args.indexOf("--base") + 1];
const head = args[args.indexOf("--head") + 1];
if (!base || !head) {
  throw new Error(
    "Usage: node scripts/check-repository-policy.mjs --base <base-sha> --head <head-sha>",
  );
}

const manifest = JSON.parse(readFileSync(".css-approvals.json", "utf8"));
const changes = git(["diff", "--name-status", "--find-renames", base, head])
  .split("\n")
  .filter(Boolean);
const oldDirs = treeDirectories(base);
const newDirs = treeDirectories(head);
const errors = [];
const warnings = [];

for (const directory of newDirs) {
  if (!oldDirs.has(directory)) {
    errors.push(
      ...validateNewPath(directory, "directory").map(
        (message) => directory + ": " + message,
      ),
    );
  }
}

for (const change of changes) {
  const [status, first, second] = change.split("\t");
  const filePath = status.startsWith("R") ? second : first;
  if (status.startsWith("D")) continue;
  const current = fileAt(head, filePath) ?? "";
  const previousPath = status.startsWith("R") ? first : filePath;
  const previous = status.startsWith("A") ? null : fileAt(base, previousPath);
  if (status.startsWith("A") || status.startsWith("R")) {
    errors.push(
      ...validateNewPath(filePath, "file").map(
        (message) => filePath + ": " + message,
      ),
    );
  }
  for (const result of validateLineCount(filePath, current, previous)) {
    (result.level === "error" ? errors : warnings).push(result.message);
  }
  errors.push(
    ...validateImportBoundaries(filePath, current).map(
      (message) => filePath + ": " + message,
    ),
  );
  errors.push(...validateCssApproval(filePath, manifest));
}

report(errors, warnings);
