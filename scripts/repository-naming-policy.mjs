import path from "node:path";
import {
  configFiles,
  frameworkFiles,
  technicalFiles,
  technicalFolders,
} from "./repository-naming-allowlists.mjs";

export function validateNewPath(filePath, kind = "file") {
  const name = path.posix.basename(filePath);
  if (kind === "file" && configFiles.has(name)) return [];
  const routeFolder =
    /^\([^/]+\)$/.test(name) ||
    /^\[{1,2}\.\.\..+\]{1,2}$/.test(name) ||
    /^\[[^/]+\]$/.test(name) ||
    /^@[a-z0-9-]+$/.test(name) ||
    /^_[a-z0-9-]+$/.test(name);
  if (kind === "directory" && (technicalFolders.has(name) || routeFolder)) {
    return [];
  }
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
    return [
      "one-word names require an established framework or technical convention",
    ];
  }
  return [];
}
