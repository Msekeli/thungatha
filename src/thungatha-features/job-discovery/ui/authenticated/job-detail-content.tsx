import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

type Props = {
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  companyDescription?: string | null;
};

const sections = [
  ["description", "Job description"],
  ["requirements", "Requirements"],
  ["benefits", "Benefits"],
  ["companyDescription", "About the company"],
] as const;

export function JobDetailContent(props: Props) {
  return (
    <Stack spacing={2}>
      {sections.map(([key, label]) => {
        const content = props[key]?.trim();
        if (!content) return null;
        return (
          <Stack spacing={1} key={key}>
            <Typography variant="h6" component="h3">{label}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{content}</Typography>
            <Divider />
          </Stack>
        );
      })}
    </Stack>
  );
}
