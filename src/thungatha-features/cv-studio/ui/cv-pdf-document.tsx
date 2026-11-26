"use client";

import { Document, Page } from "@react-pdf/renderer";
import type { CvPdfContent } from "./cv-pdf-types";
export type { CvPdfContent } from "./cv-pdf-types";
import { styles } from "./cv-pdf-styles";
import { CvPdfHeader } from "./cv-pdf-header";
import { CvPdfSummary } from "./cv-pdf-summary";
import { CvPdfExperience } from "./cv-pdf-experience";
import { CvPdfProjects } from "./cv-pdf-projects";
import { CvPdfSkills } from "./cv-pdf-skills";
import { CvPdfEducation } from "./cv-pdf-education";
import { CvPdfCertifications } from "./cv-pdf-certifications";
import { CvPdfLanguages } from "./cv-pdf-languages";
import { CvPdfFooter } from "./cv-pdf-footer";

export function CvPdfDocument({
  content,
  accent = "#0F766E",
}: {
  content: CvPdfContent;
  accent?: string;
}) {
  return (
    <Document
      title={`${content.fullName} - CV`}
      author={content.fullName}
      subject="Curriculum Vitae"
    >
      <Page size="A4" style={styles.page} wrap>
        <CvPdfHeader content={content} accent={accent} />
        <CvPdfSummary content={content} accent={accent} />
        <CvPdfExperience content={content} accent={accent} />
        <CvPdfProjects content={content} accent={accent} />
        <CvPdfSkills content={content} accent={accent} />
        <CvPdfEducation content={content} accent={accent} />
        <CvPdfCertifications content={content} accent={accent} />
        <CvPdfLanguages content={content} accent={accent} />
        <CvPdfFooter fullName={content.fullName} />
      </Page>
    </Document>
  );
}
