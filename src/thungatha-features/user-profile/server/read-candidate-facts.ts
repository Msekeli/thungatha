import "server-only";
import type { CandidateFacts } from "./candidate-facts";
import { deriveCandidateFacts } from "./candidate-facts";
import { mapRowToProfileDto } from "./user-profile-mapper";
import { readProfile } from "./repository";

export async function readCandidateFacts(userId: string, getToken: () => Promise<string | null>, asOfDate?: string): Promise<CandidateFacts | null> {
  const { data, error } = await readProfile(userId, getToken);
  if (error) throw error;
  return data ? deriveCandidateFacts(mapRowToProfileDto(data), asOfDate) : null;
}
