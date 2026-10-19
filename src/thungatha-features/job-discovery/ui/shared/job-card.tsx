import "./job-discovery-components.css";
import { AuthenticatedJobCard } from "./authenticated-job-card";
import { PublicJobCard } from "./public-job-card";

export type JobCardData = {
  id: string;
  title: string;
  employer_name: string | null;
  location_text: string | null;
  work_mode: string | null;
  employment_type: string | null;
};

type Props = {
  job: JobCardData;
  variant: "public" | "authenticated";
  selected: boolean;
  postedLabel: string;
  onSelect: () => void;
};

export function JobCard({ job, variant, selected, postedLabel, onSelect }: Props) {
  const props = { job, selected, postedLabel, onSelect };
  return variant === "public"
    ? <PublicJobCard {...props} />
    : <AuthenticatedJobCard {...props} />;
}
