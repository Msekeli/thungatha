import type { ReactNode } from "react";

export type JobTypeChipItem = {
  key: string;
  label: string;
  count?: number | null;
};

type JobTypeChipsProps = {
  items: JobTypeChipItem[];
  activeKey: string;
  onSelect: (key: string, item: JobTypeChipItem) => void;
  className: string;
  ariaLabel?: string;
  children?: ReactNode;
};

export function JobTypeChips({
  items,
  activeKey,
  onSelect,
  className,
  ariaLabel = "Job categories",
  children,
}: JobTypeChipsProps) {
  return (
    <div className={className} role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          data-active={activeKey === item.key}
          aria-pressed={activeKey === item.key}
          onClick={() => onSelect(item.key, item)}
        >
          {item.label}
          {item.count != null && <span>{item.count}</span>}
        </button>
      ))}
      {children}
    </div>
  );
}
