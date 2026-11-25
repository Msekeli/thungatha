import { Button } from "@/components/ui/button";

type CvDraftExperienceNavigationProps = {
  activeIndex: number;
  total: number;
  employer: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function CvDraftExperienceNavigation({
  activeIndex, total, employer, onPrevious, onNext,
}: CvDraftExperienceNavigationProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2 text-fg sm:gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-fg-muted sm:text-xs">
          Experience {activeIndex + 1} of {total}
        </p>
        <p className="truncate text-xs font-semibold sm:text-sm">{employer}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button type="button" size="sm" className="px-2 text-xs" variant="outline" disabled={activeIndex === 0} onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" size="sm" className="px-2 text-xs" variant="outline" disabled={activeIndex >= total - 1} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
