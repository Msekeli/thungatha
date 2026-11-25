import { execFileSync } from "node:child_process";

export function git(args, allowFailure = false) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trimEnd();
  } catch (error) {
    if (allowFailure) return null;
    throw error;
  }
}

export function fileAt(ref, filePath) {
  try {
    return execFileSync("git", ["show", ref + ":" + filePath], {
      encoding: "utf8",
    });
  } catch {
    return null;
  }
}

export function treeDirectories(ref) {
  const files = git(["ls-tree", "-r", "--name-only", ref])
    .split("\n")
    .filter(Boolean);
  const result = new Set();
  for (const file of files) {
    const parts = file.split("/");
    for (let index = 1; index < parts.length; index++) {
      result.add(parts.slice(0, index).join("/"));
    }
  }
  return result;
}
