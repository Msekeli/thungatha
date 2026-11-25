import { Text } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfLanguages({ content, accent }: { content: CvPdfContent; accent: string }) {
  return (
    <CvPdfSection title="Languages" accent={accent}>
      <Text style={styles.body}>
        {content.languages.join(" · ") || "No languages recorded in Profile."}
      </Text>
    </CvPdfSection>
  );
}
