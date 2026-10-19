import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ExternalLink } from "lucide-react";
import { JobMetadata } from "../shared/job-metadata";
import { JobSalary } from "../shared/job-salary";
import { safeExternalUrl } from "../shared/job-formatters";

type Props = {
  title: string;
  employer?: string | null;
  description?: string | null;
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  applicationUrl?: string | null;
};

export function PublicJobDetail(props: Props) {
  const url = safeExternalUrl(props.applicationUrl);
  return (
    <Stack spacing={2} className="min-w-0 rounded-xl border p-4 sm:p-6">
      <div>
        <Typography variant="h5" component="h2" fontWeight={700}>{props.title}</Typography>
        <Typography color="text.secondary">{props.employer || "Employer not listed"}</Typography>
      </div>
      <JobMetadata location={props.location} employmentType={props.employmentType} workMode={props.workMode} />
      <JobSalary minimum={props.salaryMin} maximum={props.salaryMax} currency={props.salaryCurrency} />
      {url && <Button component="a" href={url} target="_blank" rel="noreferrer" variant="contained" endIcon={<ExternalLink size={16} />}>Apply on employer site</Button>}
      <Typography variant="body1" className="whitespace-pre-line">{props.description || "No description provided by the employer."}</Typography>
    </Stack>
  );
}
