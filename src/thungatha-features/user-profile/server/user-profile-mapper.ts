import type { UpdateProfileInput, UserProfileDto } from "./user-profile-schema";

export type ProfileDatabaseRow = {
  user_id: string;
  display_name: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  country?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  summary?: string | null;
  experience?: unknown;
  education?: unknown;
  skills?: unknown;
  certifications?: unknown;
  projects?: unknown;
  master_cv?: unknown;
  confirmed_at?: string | null;
  profile_version?: number;
  created_at?: string;
  updated_at?: string;
};

export function mapRowToProfileDto(row: ProfileDatabaseRow | null): UserProfileDto {
  const fullName = row?.full_name ?? row?.display_name ?? null;
  const displayName = row?.display_name ?? row?.full_name ?? null;
  const asArr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    displayName,
    personalDetails: {
      fullName,
      email: row?.email ?? null,
      phone: row?.phone ?? null,
      location: row?.location ?? null,
      country: row?.country ?? null,
      linkedinUrl: row?.linkedin_url ?? null,
      portfolioUrl: row?.portfolio_url ?? null,
    },
    summary: row?.summary ?? null,
    workExperience: asArr(row?.experience),
    education: asArr(row?.education),
    skills: asArr(row?.skills),
    certifications: asArr(row?.certifications),
    projects: asArr(row?.projects),
    masterCv: (row?.master_cv as UserProfileDto["masterCv"]) ?? null,
    confirmedAt: row?.confirmed_at ?? null,
    profileVersion: row?.profile_version ?? 1,
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}

export function mapInputToRow(userId: string, input: UpdateProfileInput | string) {
  if (typeof input === "string") return { user_id: userId, display_name: input };
  const p = input.personalDetails;
  const fullName = p?.fullName ?? input.displayName ?? undefined;
  const displayName = input.displayName ?? p?.fullName ?? undefined;
  return {
    user_id: userId,
    ...(displayName !== undefined && { display_name: displayName }),
    ...(fullName !== undefined && { full_name: fullName }),
    ...(p?.email !== undefined && { email: p.email }),
    ...(p?.phone !== undefined && { phone: p.phone }),
    ...(p?.location !== undefined && { location: p.location }),
    ...(p?.country !== undefined && { country: p.country }),
    ...(p?.linkedinUrl !== undefined && { linkedin_url: p.linkedinUrl }),
    ...(p?.portfolioUrl !== undefined && { portfolio_url: p.portfolioUrl }),
    ...(input.summary !== undefined && { summary: input.summary }),
    ...(input.workExperience !== undefined && { experience: input.workExperience }),
    ...(input.education !== undefined && { education: input.education }),
    ...(input.skills !== undefined && { skills: input.skills }),
    ...(input.certifications !== undefined && { certifications: input.certifications }),
    ...(input.projects !== undefined && { projects: input.projects }),
    ...(input.masterCv !== undefined && { master_cv: input.masterCv }),
    ...(input.confirmedAt !== undefined && { confirmed_at: input.confirmedAt }),
  };
}
