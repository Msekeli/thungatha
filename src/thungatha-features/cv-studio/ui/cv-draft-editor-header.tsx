"use client";

type ReviewSection = {
  id: "summary" | "experience" | "skills" | "requirements";
  label: string;
  target: string;
};
type CvDraftEditorHeaderProps = {
  activeIndex: number;
  activeSection: ReviewSection["id"];
  sections: ReviewSection[];
  onSectionChange: (section: ReviewSection["id"]) => void;
};

export function CvDraftEditorHeader({
  activeIndex, activeSection, sections, onSectionChange,
}: CvDraftEditorHeaderProps) {
  return (
    <header className="shrink-0 border-b border-line px-3 pb-2 pt-3 sm:px-6 sm:pb-3 sm:pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl font-semibold text-accent-text sm:text-2xl" aria-hidden="true">✧</span>
            <h2 className="text-lg font-bold sm:text-xl">CV Tailoring</h2>
          </div>
          <p className="mt-1 text-xs text-fg-muted sm:text-sm">
            Review each section and apply the changes you agree with.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-accent/30 bg-accent-bg px-2.5 py-1 text-[10px] font-semibold text-accent-text sm:px-3 sm:text-xs">
          Step {activeIndex + 1} of 4
        </span>
      </div>
      <nav aria-label="CV tailoring steps" className="mt-2 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
        {sections.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            aria-current={activeSection === item.id ? "step" : undefined}
            className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 border-b-2 px-0.5 pb-1.5 pt-1 text-center text-[9px] font-semibold leading-tight sm:min-h-14 sm:flex-row sm:gap-2 sm:px-1 sm:pb-2 sm:pt-2 sm:text-xs ${activeSection === item.id ? "border-accent-text text-accent-text font-bold" : "border-transparent text-fg-muted hover:text-fg"}`}
          >
            <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold sm:size-6 sm:text-[10px] ${activeSection === item.id ? "border-btn bg-btn text-btn-fg" : "border-line bg-panel text-fg-muted"}`}>
              {index + 1}
            </span>
            <span className="whitespace-normal break-words">{item.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
