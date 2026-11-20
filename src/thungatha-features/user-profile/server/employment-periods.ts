export type EmploymentPeriod = { startDate: string; endDate?: string | null; isCurrent: boolean };
type MonthRange = { start: number; end: number; sourceIndex: number };
const MONTHS = new Map([
  ...["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].map((name, index) => [name, index] as const),
  ...["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map((name, index) => [name, index] as const),
]);
export function parseEmploymentMonth(value: string | null | undefined): number | null {
  if (!value) return null;
  let year = 0; let month = -1;
  const iso = /^(\\d{4})-(\\d{2})(?:-(\\d{2}))?$/.exec(value.trim());
  if (iso) {
    year = Number(iso[1]); month = Number(iso[2]) - 1;
    const day = iso[3] ? Number(iso[3]) : 1;
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
  } else {
    const named = /^([A-Za-z]+)\\s+(\\d{4})$/.exec(value.trim());
    if (!named || !MONTHS.has(named[1].toLowerCase())) return null;
    year = Number(named[2]); month = MONTHS.get(named[1].toLowerCase())!;
  }
  if (year < 1900 || year > 2200) return null;
  return year * 12 + month;
}
export function calculateKnownEmploymentMonths(periods: EmploymentPeriod[], asOfDate: string) {
  const currentMonth = parseEmploymentMonth(asOfDate);
  const known: MonthRange[] = [];
  const unknownSourceIndexes: number[] = [];
  periods.forEach((period, sourceIndex) => {
    const start = parseEmploymentMonth(period.startDate);
    const end = period.isCurrent ? currentMonth : parseEmploymentMonth(period.endDate);
    if (start === null || end === null || end < start) { unknownSourceIndexes.push(sourceIndex); return; }
    known.push({ start, end, sourceIndex });
  });
  known.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of known) {
    const last = merged.at(-1);
    if (last && range.start <= last.end + 1) last.end = Math.max(last.end, range.end);
    else merged.push({ start: range.start, end: range.end });
  }
  return {
    knownMonths: merged.reduce((total, range) => total + range.end - range.start + 1, 0),
    knownSourceIndexes: known.map((range) => range.sourceIndex), unknownSourceIndexes,
  };
}
