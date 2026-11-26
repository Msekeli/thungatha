import { Button } from "@/components/ui/button";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthYearPickerContent({
  label,
  month,
  year,
  years,
  min,
  max,
  onMonthChange,
  onYearChange,
  onCancel,
  onApply,
}: {
  label: string;
  month: number;
  year: number;
  years: number[];
  min?: string;
  max?: string;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const selected = year + "-" + String(month + 1).padStart(2, "0");
  const valid = (!min || selected >= min) && (!max || selected <= max);

  return (
    <div className="rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
      <p className="mb-3 text-sm font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Month
          <select
            aria-label="Month"
            value={month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {months.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Year
          <select
            aria-label="Year"
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!valid && (
        <p className="mt-2 text-xs text-destructive">
          {min && selected < min
            ? "Choose a month on or after the start date."
            : "Choose a month on or before the end date."}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" disabled={!valid} onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
