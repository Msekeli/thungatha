import { JobDetailDesktopDescription } from "./job-detail-desktop-description";
import { JobDescriptionContent } from "./job-description-content";

type Props = {
  description?: string | null;
  largeText?: boolean;
};

export function JobDetailDescription({ description, largeText = false }: Props) {
  return (
    <>
      <JobDetailDesktopDescription description={description ?? null} largeText={largeText} />
      <section className="min-w-0 border-t border-line pt-4 min-[601px]:hidden">
        <h3 className="mb-2 text-base font-semibold text-fg">Job description</h3>
        <JobDescriptionContent description={description} largeText={largeText} />
      </section>
    </>
  );
}
