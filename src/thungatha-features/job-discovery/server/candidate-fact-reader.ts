import "server-only";

import { readProfile } from "@/thungatha-features/user-profile/server/repository";
import { mapRowToProfileDto } from "@/thungatha-features/user-profile/server/user-profile-mapper";
import { deriveCandidateFacts } from "./candidate-facts";

export async function readCandidateFacts(
  userId: string,
  getToken: () => Promise<string | null>,
  asOfDate: string,
) {
  const { data, error } = await readProfile(userId, getToken);
  if (error) throw error;
  if (!data) return null;
  return deriveCandidateFacts(mapRowToProfileDto(data), asOfDate);
}
