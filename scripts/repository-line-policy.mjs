const sourceExtensions = /\.(?:[cm]?[jt]sx?|css|scss|sass|less|json)$/i;

export function countPhysicalLines(content) {
  if (!content) return 0;
  const lines = content.split(/\r?\n/);
  return lines.at(-1) === "" ? lines.length - 1 : lines.length;
}

/**
 * @param {string} filePath
 * @param {string} current
 * @param {string | null} previous
 */
export function validateLineCount(filePath, current, previous = null) {
  const generated =
    filePath === "src/styles/tokens.css" ||
    /(?:^|\/)(?:package-lock|.*\.generated)\./.test(filePath);
  if (!sourceExtensions.test(filePath) || generated) return [];
  const count = countPhysicalLines(current);
  if (count > 100) {
    const prior = previous === null ? 0 : countPhysicalLines(previous);
    if (prior > 100 && count < prior) {
      return [
        {
          level: "warning",
          message:
            filePath +
            " reduced from " +
            prior +
            " to " +
            count +
            " lines; legacy debt remains",
        },
      ];
    }
    return [
      {
        level: "error",
        message: filePath + " has " + count + " lines; maximum is 100",
      },
    ];
  }
  if (count >= 80) {
    return [
      {
        level: "warning",
        message:
          filePath + " has " + count + " lines; refactor before it exceeds 100",
      },
    ];
  }
  return [];
}
