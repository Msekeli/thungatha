import "./job-description-content.css";

type Props = {
  description: string | null | undefined;
  largeText?: boolean;
};

export function JobDescriptionContent({ description, largeText = false }: Props) {
  if (!description) {
    return (
      <p className="text-sm leading-6 text-fg-muted">
        The employer has not supplied a job description.
      </p>
    );
  }

  return (
    <div
      className={`th-job-description-html ${largeText ? "th-job-description-html-large" : ""}`}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}
