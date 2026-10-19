import type { ReactNode } from "react";

type JobDetailPanelProps = {
  element: "aside" | "section";
  className: string;
  ariaLabel: string;
  ariaBusy?: boolean;
  isEmpty: boolean;
  emptyClassName: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: ReactNode;
  header?: ReactNode;
  children?: ReactNode;
};

/**
 * Shared detail-panel frame and empty state. Public and authenticated detail
 * content stays in its own workflow component/page.
 */
export function JobDetailPanel({
  element,
  className,
  ariaLabel,
  ariaBusy,
  isEmpty,
  emptyClassName,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  header,
  children,
}: JobDetailPanelProps) {
  const content = (
    <>
      {header}
      {isEmpty ? (
        <div className={emptyClassName}>
          {emptyIcon}
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </>
  );

  return element === "aside" ? (
    <aside
      className={className}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
    >
      {content}
    </aside>
  ) : (
    <section
      className={className}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
    >
      {content}
    </section>
  );
}
