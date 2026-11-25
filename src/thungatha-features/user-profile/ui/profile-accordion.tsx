"use client";

import type { ReactNode } from "react";
import { AlertCircle, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileAccordion({
  title,
  description,
  status,
  children,
  onSave,
  saving = false,
}: {
  title: string;
  description?: string;
  status: string;
  children: ReactNode;
  onSave: () => void;
  saving?: boolean;
}) {
  const incomplete = status === "Incomplete";
  return (
    <details
      name="thungatha-profile-sections"
      className="group overflow-clip rounded-[9px] border border-[var(--th-line)] bg-[var(--th-panel)] transition-colors duration-150 open:border-[var(--th-accent)]"
    >
      <summary className="flex min-h-[66px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden hover:bg-[var(--th-panel-2)] [&::-webkit-details-marker]:hidden max-[700px]:min-h-[58px] max-[700px]:gap-2 max-[700px]:px-3 max-[700px]:py-[11px]">
        <span className="grid min-w-0 gap-[3px]">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {description && (
            <span className="text-xs leading-[1.4] text-muted-foreground max-[700px]:text-[10px]">
              {description}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2 max-[700px]:gap-1">
          <span
            className={[
              "whitespace-nowrap rounded-md border border-[var(--th-line)] px-2 py-1 text-[10px] text-muted-foreground max-[700px]:px-[5px] max-[700px]:py-[3px] max-[700px]:text-[9px]",
              "group-open:border-[var(--th-accent)] group-open:text-[var(--th-accent)]",
              incomplete && "text-amber-600 dark:text-amber-400",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {incomplete && (
              <AlertCircle aria-hidden="true" className="mr-1 inline size-3.5" />
            )}
            {status}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="text-muted-foreground transition-transform duration-150 group-open:rotate-180"
            size={18}
          />
        </span>
      </summary>
      <div className="border-t border-[var(--th-line)] p-[18px] [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>.grid>section]:border-0 [&>.grid>section]:bg-transparent [&>.grid>section]:p-0 [&>.grid>section]:shadow-none [&>section>:first-child]:hidden [&>.grid>section>:first-child]:hidden [&>section>form]:mt-0 max-[700px]:p-3 max-[700px]:[&_.flex.flex-col>button]:w-full">
        {children}
        {incomplete && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
            Some education details are missing. Complete the highlighted fields
            before reviewing your profile.
          </p>
        )}
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            onClick={() => onSave()}
            disabled={saving}
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save section"}
          </Button>
        </div>
      </div>
    </details>
  );
}
