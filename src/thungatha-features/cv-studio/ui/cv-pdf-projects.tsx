import { Text, View } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfSection } from "./cv-pdf-section";

export function CvPdfProjects({
  content,
  accent,
}: {
  content: CvPdfContent;
  accent: string;
}) {
  return (
    <CvPdfSection title="Projects" accent={accent}>
      {content.projects.length ? (
        content.projects.map((item) => (
          <View key={item.sourceId} style={styles.entry}>
            <Text style={styles.entryTitle}>{item.name}</Text>
            {item.role ? <Text style={styles.meta}>{item.role}</Text> : null}
            {item.description ? (
              <Text style={styles.entryBody}>{item.description}</Text>
            ) : null}
            {item.url ? <Text style={styles.meta}>{item.url}</Text> : null}
          </View>
        ))
      ) : (
        <Text style={styles.body}>No projects recorded in Profile.</Text>
      )}
    </CvPdfSection>
  );
}
