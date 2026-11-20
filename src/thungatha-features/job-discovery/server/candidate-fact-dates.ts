export function parseEmploymentMonth(value: string | null | undefined) {
  if (!value) return null;
  const text = value.trim();
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(text);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = match[3] ? Number(match[3]) : 1;
    if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
    return validMonth(year, month);
  }
  const named = /^([A-Za-z]{3,9})\s+(\d{4})$/.exec(text);
  if (!named) return null;
  const month = new Date(Date.parse(named[1] + " 1, 2000")).getMonth() + 1;
  return validMonth(Number(named[2]), month);
}

function validMonth(year: number, month: number) {
  return year >= 1900 && year <= 2200 && month >= 1 && month <= 12
    ? year * 12 + month - 1
    : null;
}

export function mergeEmploymentMonths(periods: Array<{ startMonth: number; endMonth: number }>) {
  const sorted = [...periods].sort((a, b) => a.startMonth - b.startMonth || a.endMonth - b.endMonth);
  let total = 0;
  let current: { startMonth: number; endMonth: number } | null = null;
  for (const period of sorted) {
    if (!current) current = { ...period };
    else if (period.startMonth <= current.endMonth + 1) current.endMonth = Math.max(current.endMonth, period.endMonth);
    else {
      total += current.endMonth - current.startMonth + 1;
      current = { ...period };
    }
  }
  return total + (current ? current.endMonth - current.startMonth + 1 : 0);
}
