export type CvContent = {
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
  projects: Array<{
    sourceId: string;
    name: string;
    role: string | null;
    description: string | null;
  }>;
  technicalSkills: string[];
  education: Array<{
    sourceId: string;
    qualification: string;
    institution: string;
    fieldOfStudy: string | null;
  }>;
  certifications: Array<{
    sourceId: string;
    name: string;
    issuer: string | null;
  }>;
  languages: string[];
};

export type MasterCv = {
  id: string;
  content: CvContent;
  source_profile_version?: number;
  version_number?: number;
};

export type ReusableCv = {
  id: string;
  version_number: number;
  content: CvContent;
  accent_colour: "teal" | "navy" | "burgundy" | "forest";
};

export const cvAccentHex = {
  teal: "#0F766E",
  navy: "#1D4ED8",
  burgundy: "#9F1239",
  forest: "#166534",
} as const;
