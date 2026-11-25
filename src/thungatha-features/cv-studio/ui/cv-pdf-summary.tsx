import { Text } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfSummary({ content, accent }: { content: CvPdfContent; accent: string }) {
  if (!content.professionalSummary) return null;
  return (
    <CvPdfSection title="Professional summary" accent={accent}>
      <Text style={styles.body}>{content.professionalSummary}</Text>
    </CvPdfSection>
  );
}
