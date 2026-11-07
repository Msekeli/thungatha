import { JobDetailDesktopDescription } from "./job-detail-desktop-description";
import { JobDescriptionContent } from "./job-description-content";

type Props = {
  description?: string | null;
  descriptionIsPreview?: boolean;
  largeText?: boolean;
};

export function JobDetailDescription({
  description,
  descriptionIsPreview = false,
  largeText = false,
}: Props) {
  return (
    <>
      <JobDetailDesktopDescription
        description={description ?? null}
        descriptionIsPreview={descriptionIsPreview}
        largeText={largeText}
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
        <JobDescriptionContent description={description} largeText={largeText} />
      </section>
    </>
  );
}
