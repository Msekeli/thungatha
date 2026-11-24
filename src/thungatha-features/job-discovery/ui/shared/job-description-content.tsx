import { jobDescriptionToText } from "@/thungatha-features/job-discovery/server/job-requirement-text";
import "./job-description-content.css";

type Props = {
  description: string | null | undefined;
  largeText?: boolean;
};

export function JobDescriptionContent({
  description,
  largeText = false,
}: Props) {
  if (!description) {
    return (
      <p className="text-sm leading-6 text-fg-muted">
        The employer has not supplied a job description.
      </p>
    );
  }

  return (
    <div
      className={`th-job-description-html whitespace-pre-line ${largeText ? "th-job-description-html-large" : ""}`}
    >
      {jobDescriptionToText(description)}
    </div>
  );
}
