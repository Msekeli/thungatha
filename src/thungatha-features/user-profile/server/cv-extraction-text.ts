function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[0]?.trim() ?? null;
}
function sectionLines(lines: string[], headings: RegExp, stops: RegExp) {
  const start = lines.findIndex((line) => headings.test(line));
  if (start < 0) return [];
  const endOffset = lines
    .slice(start + 1)
    .findIndex((line) => stops.test(line));
  return lines.slice(
    start + 1,
    endOffset < 0 ? undefined : start + 1 + endOffset,
  );
}
