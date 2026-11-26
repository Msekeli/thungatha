import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusStyles = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", {
  variants: {
    status: {
      Draft: "border-border bg-muted text-muted-foreground",
      Submitted: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
      "Under review": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      Interview: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      Offer: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      Accepted: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
      Rejected: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      Withdrawn: "border-border bg-muted text-muted-foreground",
    },
  },
});

type Props = VariantProps<typeof statusStyles> & { className?: string };

export function ApplicationStatusBadge({ status, className }: Props) {
  if (!status) return null;
  return <span className={cn(statusStyles({ status }), className)}>{status}</span>;
}
