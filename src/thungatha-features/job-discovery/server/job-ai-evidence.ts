import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import { sourceSegments } from "./job-requirement-text";

export type EvidenceItem = { id: string; sourcePath: string; content: string };

export function buildJobEvidence(description: string): EvidenceItem[] {
  return sourceSegments(description).map((content, index) => ({
    id: `job:segment:${index + 1}`, sourcePath: "description", content,
  }));
}

export function buildProfileEvidence(facts: CandidateFacts): EvidenceItem[] {
  return facts.evidence;
}

export function assertEvidenceReferences(references: string[], allowed: Set<string>) {
  return references.every((reference) => allowed.has(reference));
}
