import { JobDescriptionContent } from "./job-description-content";

type Props = {
  description?: string | null;
  largeText?: boolean;
};

export function JobDetailDescription({ description, largeText = false }: Props) {
  return (
    <section className="th-job-detail-description min-w-0 text-fg">
      <h3 className="mb-3 text-base font-semibold text-fg">Job description</h3>
      <JobDescriptionContent description={description} largeText={largeText} />
    </section>
  );
}
