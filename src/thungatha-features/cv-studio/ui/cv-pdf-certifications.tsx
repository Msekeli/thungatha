import { Text, View } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfCertifications({
  content,
  accent,
}: {
  content: CvPdfContent;
  accent: string;
}) {
  return (
    <CvPdfSection title="Certifications" accent={accent}>
      {content.certifications.length ? (
        content.certifications.map((item) => (
          <View key={item.sourceId} style={styles.entry}>
            <Text style={styles.body}>
              {item.name}
              {item.issuer ? ` · ${item.issuer}` : ""}
            </Text>
            {item.issueDate ||
            item.expiryDate ||
            item.issuingCountry ||
            item.type ? (
              <Text style={styles.meta}>
                {[
                  item.type?.replaceAll("-", " "),
                  item.issueDate,
                  item.expiryDate ? `Expires ${item.expiryDate}` : null,
                  item.issuingCountry,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            ) : null}
            {item.licenceCategories?.length ? (
              <Text style={styles.meta}>
                Categories: {item.licenceCategories.join(", ")}
              </Text>
            ) : null}
            {item.endorsements ? (
              <Text style={styles.entryBody}>{item.endorsements}</Text>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.body}>No certifications recorded in Profile.</Text>
      )}
    </CvPdfSection>
  );
}
