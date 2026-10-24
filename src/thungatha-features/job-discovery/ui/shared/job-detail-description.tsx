import { JobDetailDesktopDescription } from "./job-detail-desktop-description";

type Props = {
  description?: string | null;
  descriptionIsPreview?: boolean;
};

export function JobDetailDescription({
  description,
  descriptionIsPreview = false,
}: Props) {
  const content = description?.trim();
  return (
    <>
      <JobDetailDesktopDescription
        description={content ?? null}
        descriptionIsPreview={descriptionIsPreview}
      />
      <section className="min-w-0 border-t border-line pt-4 min-[601px]:hidden">
        <h3 className="mb-2 text-base font-semibold text-fg">
          {descriptionIsPreview ? "Description preview" : "Job description"}
        </h3>
        {descriptionIsPreview && (
          <p className="mb-2 text-sm text-fg-muted">
            This source provides a preview. Open the original listing for the
            complete details when available.
          </p>
        )}
        <div className="whitespace-pre-wrap break-words text-sm leading-6 text-fg">
          {content ||
            "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
        </div>
      </section>
    </>
  );
}
