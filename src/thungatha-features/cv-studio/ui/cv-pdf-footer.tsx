import { Text, View } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";

export function CvPdfFooter({ fullName }: { fullName: CvPdfContent["fullName"] }) {
  return (
    <View fixed style={styles.footer}>
      <Text>{fullName} · Curriculum Vitae</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}
