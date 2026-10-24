export function displayProfileMonth(value?: string | null) {
  if (!value || /not specified/i.test(value)) return "Not specified";
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1).toLocaleDateString("en", { month: "short", year: "numeric" });
  return value;
}
