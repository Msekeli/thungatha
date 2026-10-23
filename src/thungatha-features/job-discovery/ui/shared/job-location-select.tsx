"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function JobLocationSelect({ value, onChange }: Props) {
  return (
    <select
      aria-label="Search location"
      value={value || "Anywhere"}
      onChange={(event) =>
        onChange(event.target.value === "Anywhere" ? "" : event.target.value)
      }
      className="h-11 w-full min-w-0 rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] px-3 text-sm text-[var(--th-fg)] outline-none focus-visible:border-[var(--th-accent)]"
    >
      <option value="Anywhere">Anywhere</option>
      <option value="Cape Town">Cape Town</option>
      <option value="Johannesburg">Johannesburg</option>
      <option value="Durban">Durban</option>
      <option value="Remote">Remote</option>
    </select>
  );
}
