import type { CandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import { sourceSegments } from "./job-requirement-text";

export type EvidenceItem = { id: string; sourcePath: string; content: string };

export function buildJobEvidence(
  description: string,
  context?: { title?: string | null; employerName?: string | null; locationText?: string | null },
): EvidenceItem[] {
  const contextEvidence: EvidenceItem[] = [
    ...(context?.title ? [{ id: "job:context:title", sourcePath: "title", content: context.title }] : []),
    ...(context?.employerName ? [{ id: "job:context:employer", sourcePath: "employer_name", content: context.employerName }] : []),
    ...(context?.locationText ? [{ id: "job:context:location", sourcePath: "location_text", content: context.locationText }] : []),
  ];
  const descriptionEvidence = sourceSegments(description).map((content, index) => ({
    id: `job:segment:${index + 1}`, sourcePath: "description", content,
  }));
  return [...contextEvidence, ...descriptionEvidence];
}

export function buildProfileEvidence(facts: CandidateFacts): EvidenceItem[] {
  return facts.evidence;
}

export function assertEvidenceReferences(references: string[], allowed: Set<string>) {
  return references.every((reference) => allowed.has(reference));
}
