import type { ReactNode } from "react";
import { Text, View } from "@react-pdf/renderer";
import { styles } from "./cv-pdf-styles";

export function CvPdfSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section} minPresenceAhead={24}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}
