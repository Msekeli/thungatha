import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  presentation?: "card" | "minimal";
  icon?: ReactNode;
};

export function JobEmptyState({
  title,
  message,
  actionLabel,
  onAction,
  presentation = "card",
  icon,
}: Props) {
  return (
    <div
      className={[
        "flex flex-col items-center gap-3 text-center",
        presentation === "card"
          ? "rounded-3xl border border-line p-8"
          : "px-4 py-12",
      ].join(" ")}
    >
      {icon ?? <SearchX size={28} aria-hidden="true" />}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      <p className="text-sm text-fg-muted">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
