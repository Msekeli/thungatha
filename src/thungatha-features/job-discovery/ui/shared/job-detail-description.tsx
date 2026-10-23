import { JobDetailDesktopDescription } from "./job-detail-desktop-description";

type Props = { description?: string | null };

export function JobDetailDescription({ description }: Props) {
  const content = description?.trim();
  return (
    <>
      <JobDetailDesktopDescription description={content ?? null} />
      <section className="min-w-0 border-t border-line pt-4 min-[601px]:hidden">
        <h3 className="mb-2 text-base font-semibold text-fg">
          Job description
        </h3>
        <div className="whitespace-pre-wrap break-words text-sm leading-6 text-fg">
          {content ||
            "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
        </div>
      </section>
    </>
  );
}
