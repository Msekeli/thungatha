import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";

export function ProfileReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
    <section className="border-b border-border py-5 print:break-inside-avoid print:border-gray-300">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold uppercase tracking-wide">
          {title}
        </h2>
        <Button
          className="print:hidden"
          type="button"
          size="sm"
          variant="ghost"
          onClick={onEdit}
        >
          <PencilLine /> Edit
        </Button>
      </header>
      <div className="text-sm leading-6">{children}</div>
    </section>
  );
}
