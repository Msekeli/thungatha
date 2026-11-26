import { Text, View } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfEducation({ content, accent }: { content: CvPdfContent; accent: string }) {
  return (
    <CvPdfSection title="Education" accent={accent}>
      {content.education.length ? (
        content.education.map((item) => (
          <View key={item.sourceId} style={styles.entry}>
            <Text style={styles.entryTitle}>{item.qualification}</Text>
            <Text style={styles.entryBody}>
              {item.institution}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
            </Text>
            {item.educationLevel || item.startDate || item.endDate ? (
              <Text style={styles.meta}>
                {[
                  item.educationLevel,
                  item.startDate
                    ? `${item.startDate} – ${item.isCurrent ? "Present" : (item.endDate ?? "End date not supplied")}`
                    : null,
                ].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.body}>No education recorded in Profile.</Text>
      )}
    </CvPdfSection>
  );
}
