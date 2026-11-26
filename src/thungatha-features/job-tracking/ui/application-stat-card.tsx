import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

export function ApplicationStatCard({ label, value, description, icon: Icon }: Props) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
        </div>
        <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </article>
  );
}
