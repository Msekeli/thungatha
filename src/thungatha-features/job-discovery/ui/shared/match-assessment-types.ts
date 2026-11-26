export type EvidenceItem = { id: string; sourcePath: string; content: string };

export type RequirementAssessment = {
  requirement: string;
  importance: "mandatory" | "preferred" | "uncertain";
  assessment: "supported" | "not_demonstrated" | "contradictory" | "uncertain";
  explanation: string;
  jobEvidenceRefs: string[];
  profileEvidenceRefs: string[];
  jobEvidence?: EvidenceItem[];
  profileEvidence?: EvidenceItem[];
};

export type MatchAssessment = {
  classification: "match" | "relevant";
  summary: string;
  alignmentExplanation: string;
  requirements: RequirementAssessment[];
  semanticAlignment?: {
    jobEvidence?: EvidenceItem[];
    profileEvidence?: EvidenceItem[];
  };
  understandingCoverage?: "complete" | "partial" | "unavailable";
  gaps: Array<{
    description: string;
    jobEvidenceRefs: string[];
    profileEvidenceRefs: string[];
    jobEvidence?: EvidenceItem[];
    profileEvidence?: EvidenceItem[];
  }>;
};

export type AssessmentStatus =
  | "idle"
  | "loading"
  | "pending"
  | "failed"
  | "unavailable"
  | "unusable_description"
  | "profile_unconfirmed"
  | "ready"
  | "error";
