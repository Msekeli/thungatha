"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { MonthYearPickerContent } from "./month-year-content";

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
  const years = Array.from(
    { length: new Date().getFullYear() + 16 - 1940 },
    (_, index) => 1940 + index,
  );
  const selected = year + "-" + String(month + 1).padStart(2, "0");

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
              ).toLocaleDateString("en-ZA", {
                month: "short",
                year: "numeric",
              })
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
          <Popover.Popup role="dialog" aria-label={label}>
            <MonthYearPickerContent
              label={label}
              month={month}
              year={year}
              years={years}
              min={min}
              max={max}
              onMonthChange={setMonth}
              onYearChange={setYear}
              onCancel={() => setOpen(false)}
              onApply={() => {
                onChange(selected);
                setOpen(false);
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
