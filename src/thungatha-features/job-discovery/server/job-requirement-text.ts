export function sourceSegments(description: string) {
  return description
    .replace(/<\\/(?:p|div|li|h[1-6]|tr)>/gi, "\\n")
    .replace(/<br\\s*\\/?\\s*>/gi, "\\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .split(/\\n|(?<=[.!?;])\\s+|\\s+[•▪◦]\\s+/)
    .map((part) => part.replace(/\\s+/g, " ").trim())
    .filter((part) => part.length >= 8);
}

export function hasExactTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
  return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "i").test(text);
}
