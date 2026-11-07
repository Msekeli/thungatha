import { JobDescriptionContent } from "./job-description-content";

type Props = {
  description?: string | null;
  largeText?: boolean;
};

export function JobDetailDescription({
  description,
  largeText = false,
}: Props) {
  return (
    <section className="th-job-description-panel min-w-0 rounded-lg border border-line bg-panel p-4 text-fg sm:p-5">
      <h3 className="mb-3 text-base font-bold text-fg">Job description</h3>
      <JobDescriptionContent description={description} largeText={largeText} />
    </section>
  );
}
