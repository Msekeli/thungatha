import "server-only";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export type ExtractedExperience = {
  id: string;
  jobTitle: string;
  employer: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  achievements: string[];
};
export type ExtractedEducation = {
  id: string;
  qualification: string;
  institution: string;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};
export type CvExtraction = {
  status: "success" | "partial" | "failed";
  extractedTextLength: number;
  fields: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    summary: string | null;
    skills: string[];
    workExperience: ExtractedExperience[];
    education: ExtractedEducation[];
  };
  warnings: string[];
};
export const emptyCvExtractionFields: CvExtraction["fields"] = {
  fullName: null,
  email: null,
  phone: null,
  linkedinUrl: null,
  portfolioUrl: null,
  summary: null,
  skills: [],
  workExperience: [],
  education: [],
};
