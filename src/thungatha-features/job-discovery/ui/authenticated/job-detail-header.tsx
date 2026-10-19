import { ExternalLink } from "lucide-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { JobMetadata } from "../shared/job-metadata";

type Props = {
  title: string;
  employer?: string | null;
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  posted?: string | null;
  applicationUrl?: string | null;
};

export function JobDetailHeader(props: Props) {
  const { title, employer, location, employmentType, workMode, posted, applicationUrl } = props;
  return (
    <Stack spacing={1.5}>
      <div>
        <Typography variant="h5" component="h2" fontWeight={700}>{title}</Typography>
        <Typography color="text.secondary">{employer || "Employer not listed"}</Typography>
      </div>
      <JobMetadata location={location} employmentType={employmentType} workMode={workMode} posted={posted} />
      {applicationUrl && (
        <Button component="a" href={applicationUrl} target="_blank" rel="noreferrer" variant="contained" endIcon={<ExternalLink size={16} />}>
          Apply for this job
        </Button>
      )}
    </Stack>
  );
}
