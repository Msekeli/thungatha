import { Check, Circle } from "lucide-react";

export type DismissalScope = "job" | "employer";

export function JobDismissalOption({
  selected,
  disabled,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  disabled: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={[
        "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected ? "border-accent bg-accent/10 ring-2 ring-accent/20" : "border-line bg-panel hover:border-accent/70 hover:bg-panel-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ].join(" ")}
    >
      <span className={selected
        ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
        : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-fg-muted"
      }>
        {selected ? <Check size={13} strokeWidth={3} /> : <Circle size={9} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-fg-muted">{description}</span>
      </span>
    </button>
  );
}
