import { Text, View } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";

export function CvPdfHeader({
  content,
  accent,
}: {
  content: CvPdfContent;
  accent: string;
}) {
  const contact = [
    content.email,
    content.phone,
    content.location,
    content.linkedinUrl,
    content.portfolioUrl,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={[styles.header, { borderBottomColor: accent }]}>
      <Text style={styles.name}>{content.fullName}</Text>
      {content.headline ? (
        <Text style={styles.headline}>{content.headline}</Text>
      ) : null}
      <Text style={styles.contact}>{contact}</Text>
    </View>
  );
}
