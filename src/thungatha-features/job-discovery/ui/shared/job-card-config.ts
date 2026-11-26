export type JobCardData = {
  id: string;
  title: string;
  employer_name: string;
  company_logo_url: string | null;
  location_text: string | null;
  published_at?: string | null;
  matchClassification?: "match" | "relevant" | "unclassified" | null;
};

export const jobCardClassName =
  "relative flex min-w-0 min-h-[218px] flex-col overflow-hidden rounded-[var(--th-radius-card)] border border-[var(--th-public-card-border)] bg-[var(--th-public-card-bg)] shadow-[var(--th-public-card-shadow)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--th-card-hover-border)] hover:shadow-[var(--th-shadow-card-hover)] data-[selected=true]:border-[var(--th-accent)] data-[selected=true]:shadow-[0_0_0_2px_color-mix(in_srgb,var(--th-accent)_22%,transparent),var(--th-public-card-shadow)] motion-reduce:transition-none max-[640px]:min-h-0";

export const jobCardSelectClassName =
  "absolute inset-0 z-0 h-full w-full cursor-pointer border-0 bg-transparent focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--th-accent)]";

export const jobCardHeaderClassName =
  "relative z-[1] flex min-h-[88px] min-w-0 items-center gap-3 border-b-[3px] border-[var(--th-public-band-border)] bg-[linear-gradient(115deg,var(--th-public-band-from),var(--th-public-band-to))] px-4 py-3.5 text-[var(--th-on-band)] pointer-events-none max-[640px]:min-h-[72px] max-[640px]:gap-[9px] max-[640px]:px-2.5 max-[640px]:py-2.5";

export const jobCardLogoClassName =
  "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--th-radius-panel)] border border-[var(--th-logo-border)] bg-[var(--th-logo-bg)] object-contain text-lg font-bold text-[var(--th-logo-fg)] max-[640px]:size-11";

export const jobCardHeadingClassName = "min-w-0 flex-1";

export const jobCardTitleClassName =
  "line-clamp-2 overflow-hidden text-[var(--text-card-title)] font-[var(--text-card-title--font-weight)] leading-[var(--text-card-title--line-height)] text-[var(--th-on-band)] [overflow-wrap:anywhere] max-[640px]:text-[17px] max-[640px]:font-semibold max-[640px]:leading-[1.25]";

export const jobCardEmployerClassName =
  "mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-card-company)] leading-[var(--text-card-company--line-height)] text-[var(--th-on-band-muted)] max-[640px]:text-sm max-[640px]:leading-[1.3]";

export const jobCardExternalClassName =
  "shrink-0 text-[var(--th-accent-on-navy)]";

export const jobCardBodyClassName =
  "relative z-[1] flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-3 pt-3.5 pointer-events-none max-[640px]:gap-2 max-[640px]:px-2.5 max-[640px]:py-[9px]";

export const jobCardMetadataClassName =
  "flex min-w-0 flex-wrap items-start gap-2";

export const jobCardLocationClassName =
  "inline-flex max-w-full min-w-0 items-start gap-[7px] rounded-[var(--th-radius-tag)] bg-[var(--th-public-location-bg)] px-2.5 py-[7px] text-[var(--text-card-meta)] leading-[var(--text-card-meta--line-height)] text-[var(--th-public-location-text)] [overflow-wrap:anywhere] max-[640px]:px-2 max-[640px]:py-[5px] max-[640px]:text-[13px] max-[640px]:leading-[1.35]";

export const jobCardFooterClassName =
  "mt-auto flex min-w-0 flex-wrap items-center justify-between gap-2.5 border-t border-[var(--th-public-card-border)] pt-3 pointer-events-auto max-[640px]:gap-2 max-[640px]:pt-2";

export const jobCardPostedClassName =
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[var(--text-detail)] leading-[var(--text-detail--line-height)] text-[var(--th-fg-muted)]";

export const jobCardActionsClassName =
  "flex shrink-0 flex-wrap items-center justify-end gap-2";

export const jobCardActionClassName =
  "inline-flex min-h-8 min-w-0 items-center justify-center gap-1.5 rounded-[var(--th-radius-control)] border border-transparent px-[9px] py-1 text-xs font-semibold transition-[background-color,border-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--th-accent)] motion-reduce:transition-none";
