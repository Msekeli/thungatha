export type CvPdfContent = {
  fullName: string;
  headline: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  professionalSummary: string;
  workExperience: Array<{
    sourceId: string;
    jobTitle: string;
    employer: string;
    location?: string | null;
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
    url?: string | null;
  }>;
  technicalSkills: string[];
  education: Array<{
    sourceId: string;
    educationLevel?: string | null;
    qualification: string;
    institution: string;
    fieldOfStudy: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean;
  }>;
  certifications: Array<{
    sourceId: string;
    type?: string | null;
    name: string;
    issuer: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    issuingCountry?: string | null;
    licenceCategories?: string[];
    endorsements?: string | null;
  }>;
  languages: string[];
};
