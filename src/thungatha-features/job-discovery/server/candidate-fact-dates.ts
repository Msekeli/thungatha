export function parseEmploymentMonth(value: string | null | undefined) {
  if (!value) return null;
  const text = value.trim();
  let match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(text);
  if (match) return validMonth(Number(match[1]), Number(match[2]));
  match = /^([A-Za-z]{3,9})\s+(\d{4})$/.exec(text);
  if (!match) return null;
  const month = new Date(Date.parse(match[1] + " 1, 2000")).getMonth() + 1;
  return validMonth(Number(match[2]), month);
}

function validMonth(year: number, month: number) {
  return year >= 1900 && year <= 2200 && month >= 1 && month <= 12
    ? year * 12 + month - 1
    : null;
}

export function mergeEmploymentMonths(periods: Array<{ start: number; end: number }>) {
  const sorted = [...periods].sort((a, b) => a.start - b.start || a.end - b.end);
  let total = 0;
  let current: { start: number; end: number } | null = null;
  for (const period of sorted) {
    if (!current) current = { ...period };
    else if (period.start <= current.end + 1) current.end = Math.max(current.end, period.end);
    else {
      total += current.end - current.start + 1;
      current = { ...period };
    }
  }
  return total + (current ? current.end - current.start + 1 : 0);
}
