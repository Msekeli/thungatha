"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
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
type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  min?: string;
  max?: string;
  disabled?: boolean;
};

export function MonthYearPicker({
  value,
  onChange,
  label,
  min,
  max,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    value ? Number(value.slice(5, 7)) - 1 : new Date().getMonth(),
  );
  const [year, setYear] = useState(
    value ? Number(value.slice(0, 4)) : new Date().getFullYear(),
  );
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setMonth(value ? Number(value.slice(5, 7)) - 1 : new Date().getMonth());
      setYear(value ? Number(value.slice(0, 4)) : new Date().getFullYear());
    }
    setOpen(nextOpen);
  };
  const selected = `${year}-${String(month + 1).padStart(2, "0")}`;
  const years = Array.from(
    { length: new Date().getFullYear() + 16 - 1940 },
    (_, index) => 1940 + index,
  );
  const valid = (!min || selected >= min) && (!max || selected <= max);
  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger
        type="button"
        disabled={disabled}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value
            ? new Date(
                Number(value.slice(0, 4)),
                Number(value.slice(5, 7)) - 1,
              ).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })
            : label}
        </span>
        <CalendarDays className="size-4 text-muted-foreground" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-[1500] w-[min(320px,calc(100vw-24px))]"
        >
          <Popover.Popup
            role="dialog"
            aria-label={label}
            className="rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
          >
            <p className="mb-3 text-sm font-semibold">{label}</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                Month
                <select
                  aria-label="Month"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
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
                  onChange={(event) => setYear(Number(event.target.value))}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!valid}
                onClick={() => {
                  onChange(selected);
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
