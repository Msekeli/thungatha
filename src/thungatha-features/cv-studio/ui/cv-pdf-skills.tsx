import { Text } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfSkills({
  content,
  accent,
}: {
  content: CvPdfContent;
  accent: string;
}) {
  return (
    <CvPdfSection title="Skills" accent={accent}>
      <Text style={styles.body}>
        {content.technicalSkills.join(" · ") ||
          "No skills recorded in Profile."}
      </Text>
    </CvPdfSection>
  );
}
