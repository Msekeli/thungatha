type JobDetailTabItem = {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
};

type JobDetailTabsProps = {
  className: string;
  tabs: JobDetailTabItem[];
  ariaLabel?: string;
};

/**
 * Shared tab-list presentation for the public and authenticated job details.
 * The parent owns tab state and section navigation so each workflow stays separate.
 */
export function JobDetailTabs({
  className,
  tabs,
  ariaLabel = "Job information",
}: JobDetailTabsProps) {
  return (
    <div className={className} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={Boolean(tab.selected)}
          data-active={Boolean(tab.selected)}
          onClick={tab.onSelect}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
