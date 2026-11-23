"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type CvPdfContent = {
  fullName: string;
  headline: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  professionalSummary: string;
  workExperience: Array<{
    sourceId: string;
    jobTitle: string;
    employer: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    achievements: string[];
  }>;
  projects: Array<{ sourceId: string; name: string; role: string | null; description: string | null }>;
  technicalSkills: string[];
  education: Array<{ sourceId: string; qualification: string; institution: string; fieldOfStudy: string | null }>;
  certifications: Array<{ sourceId: string; name: string; issuer: string | null }>;
  languages: string[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 54,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.42,
    color: "#172033",
    backgroundColor: "#FFFFFF",
  },
  header: {
    borderBottomWidth: 2,
    paddingBottom: 14,
    marginBottom: 5,
  },
  name: { fontSize: 25, lineHeight: 1.12, fontFamily: "Helvetica-Bold", color: "#111827" },
  headline: { marginTop: 5, fontSize: 12, color: "#475569" },
  contact: { marginTop: 9, fontSize: 8.5, lineHeight: 1.4, color: "#475569" },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 9,
    lineHeight: 1.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.7,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  body: { fontSize: 9.5, lineHeight: 1.45 },
  entry: { marginBottom: 10 },
  entryTitle: { fontSize: 9.5, lineHeight: 1.3, fontFamily: "Helvetica-Bold" },
  meta: { marginTop: 2, fontSize: 8, color: "#64748B" },
  entryBody: { marginTop: 4, fontSize: 9, lineHeight: 1.4 },
  bullet: { marginTop: 2, paddingLeft: 9, fontSize: 8.8, lineHeight: 1.35 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#CBD5E1",
    paddingTop: 6,
    fontSize: 7.5,
    color: "#64748B",
  },
});

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <View style={styles.section} minPresenceAhead={24}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

export function CvPdfDocument({ content, accent = "#0F766E" }: { content: CvPdfContent; accent?: string }) {
  const contact = [content.email, content.phone, content.location].filter(Boolean).join(" · ");

  return (
    <Document title={`${content.fullName} - CV`} author={content.fullName} subject="Curriculum Vitae">
      <Page size="A4" style={styles.page} wrap>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <Text style={styles.name}>{content.fullName}</Text>
          {content.headline ? <Text style={styles.headline}>{content.headline}</Text> : null}
          <Text style={styles.contact}>{contact}</Text>
        </View>

        {content.professionalSummary ? (
          <Section title="Professional summary" accent={accent}>
            <Text style={styles.body}>{content.professionalSummary}</Text>
          </Section>
        ) : null}

        <Section title="Professional experience" accent={accent}>
          {content.workExperience.length ? content.workExperience.map((item) => (
            <View key={item.sourceId} style={styles.entry} wrap={false}>
              <Text style={styles.entryTitle}>{item.jobTitle} · {item.employer}</Text>
              <Text style={styles.meta}>{item.startDate} – {item.isCurrent ? "Present" : item.endDate ?? "End date not supplied"}</Text>
              {item.description ? <Text style={styles.entryBody}>{item.description}</Text> : null}
              {item.achievements.map((achievement, index) => (
                <Text key={`${item.sourceId}-achievement-${index}`} style={styles.bullet}>• {achievement}</Text>
              ))}
            </View>
          )) : <Text style={styles.body}>No work experience recorded in Profile.</Text>}
        </Section>

        <Section title="Personal projects" accent={accent}>
          {content.projects.length ? content.projects.map((item) => (
            <View key={item.sourceId} style={styles.entry} wrap={false}>
              <Text style={styles.entryTitle}>{item.name}</Text>
              {item.role ? <Text style={styles.meta}>{item.role}</Text> : null}
              {item.description ? <Text style={styles.entryBody}>{item.description}</Text> : null}
            </View>
          )) : <Text style={styles.body}>No projects recorded in Profile.</Text>}
        </Section>

        <Section title="Technical skills" accent={accent}>
          <Text style={styles.body}>{content.technicalSkills.join(" · ") || "No skills recorded in Profile."}</Text>
        </Section>

        <Section title="Education" accent={accent}>
          {content.education.length ? content.education.map((item) => (
            <View key={item.sourceId} style={styles.entry} wrap={false}>
              <Text style={styles.entryTitle}>{item.qualification}</Text>
              <Text style={styles.entryBody}>{item.institution}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}</Text>
            </View>
          )) : <Text style={styles.body}>No education recorded in Profile.</Text>}
        </Section>

        <Section title="Certifications" accent={accent}>
          {content.certifications.length ? content.certifications.map((item) => (
            <View key={item.sourceId} style={styles.entry} wrap={false}>
              <Text style={styles.body}>{item.name}{item.issuer ? ` · ${item.issuer}` : ""}</Text>
            </View>
          )) : <Text style={styles.body}>No certifications recorded in Profile.</Text>}
        </Section>

        <Section title="Languages" accent={accent}>
          <Text style={styles.body}>{content.languages.join(" · ") || "No languages recorded in Profile."}</Text>
        </Section>

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) => (
            <>
              <Text>{content.fullName} · Curriculum Vitae</Text>
              <Text>Page {pageNumber} of {totalPages}</Text>
            </>
          )}
        />
      </Page>
    </Document>
  );
}
