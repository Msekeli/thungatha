"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  emptyMeansDefault?: boolean;
};

export function JobLocationSelect({ value, onChange, emptyMeansDefault }: Props) {
  return (
    <select
      aria-label="Search location"
      value={value || (emptyMeansDefault ? "Cape Town" : "Anywhere")}
      onChange={(event) => onChange(event.target.value === "Anywhere" ? "" : event.target.value)}
      className="h-11 w-full min-w-0 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] px-3 text-sm text-[var(--th-fg)] outline-none focus-visible:border-[var(--th-accent)]"
    >
      <option>Cape Town</option>
      <option>Johannesburg</option>
      <option>Durban</option>
      <option>Remote</option>
      <option>Anywhere</option>
    </select>
  );
}
