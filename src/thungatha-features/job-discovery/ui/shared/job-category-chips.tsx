"use client";

type Props = {
  activeKey: string;
  prominent?: boolean;
  className?: string;
  onSelect: (key: string, label: string) => void;
};

export function JobCategoryChips({
  activeKey,
  prominent = false,
  className = "",
  onSelect,
}: Props) {
  const categories = [{ key: "all", label: "All opportunities" }];
  return (
    <div
      role="group"
      aria-label="Opportunity categories"
      className={`flex flex-wrap items-center gap-2.5 ${prominent ? "justify-center" : ""} ${className}`}
    >
      {categories.map((item) => {
        const active = activeKey === item.key;
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(item.key, item.label)}
            className={`h-9 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--th-accent)] ${prominent ? (active ? "border-public-action-bg bg-public-chip-bg text-public-chip-text" : "border-public-chip-border bg-public-chip-bg text-public-chip-text hover:brightness-110") : active ? "border-[var(--th-accent)] bg-transparent text-[var(--th-fg)]" : "border-[var(--th-line)] text-[var(--th-fg)] hover:bg-[var(--th-panel-2)]"}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
