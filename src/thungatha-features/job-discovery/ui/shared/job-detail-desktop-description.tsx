import { JobDescriptionContent } from "./job-description-content";

export function JobDetailDesktopDescription({
  description,
  largeText = false,
}: {
  description: string | null;
  largeText?: boolean;
}) {
  return (
    <section className="th-job-description-panel min-w-0 rounded-lg border border-line bg-panel p-4 text-fg">
      <h3 className="mb-3 text-base font-bold text-fg">Job description</h3>
      <JobDescriptionContent description={description} largeText={largeText} />
    </section>
  );
}
