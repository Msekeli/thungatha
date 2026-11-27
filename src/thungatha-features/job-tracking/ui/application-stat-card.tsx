import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

export function ApplicationStatCard({ label, value, description, icon: Icon }: Props) {
  return (
    <article className="rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">{value}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{description}</p>
    </article>
  );
}
