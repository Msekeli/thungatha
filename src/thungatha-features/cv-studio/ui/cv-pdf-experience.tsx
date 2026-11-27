import { Text, View } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfExperience({
  content,
  accent,
}: {
  content: CvPdfContent;
  accent: string;
}) {
  return (
    <CvPdfSection title="Professional experience" accent={accent}>
      {content.workExperience.length ? (
        content.workExperience.map((item) => (
          <View key={item.sourceId} style={styles.entry}>
            <Text style={styles.entryTitle}>
              {item.jobTitle} · {item.employer}
            </Text>
            <Text style={styles.meta}>
              {item.startDate} –{" "}
              {item.isCurrent
                ? "Present"
                : (item.endDate ?? "End date not supplied")}
              {item.location ? ` · ${item.location}` : ""}
            </Text>
            {item.description ? (
              <Text style={styles.entryBody}>{item.description}</Text>
            ) : null}
            {item.achievements.map((achievement, index) => (
              <Text
                key={`${item.sourceId}-achievement-${index}`}
                style={styles.bullet}
              >
                • {achievement}
              </Text>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.body}>No work experience recorded in Profile.</Text>
      )}
    </CvPdfSection>
  );
}
