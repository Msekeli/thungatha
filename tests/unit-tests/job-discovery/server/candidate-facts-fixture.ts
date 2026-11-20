import type { UserProfileDto } from "@/thungatha-features/user-profile/server/user-profile-schema";

export const profile = (overrides: Partial<UserProfileDto> = {}): UserProfileDto => ({
  displayName: "Candidate",
  nextRole: null,
  personalDetails: {
    fullName: "Candidate", email: "candidate@example.com", phone: "0123456789",
    location: "Cape Town", country: "South Africa", residentialSuburb: "Observatory",
    residentialCity: "Cape Town", residentialProvince: "Western Cape",
  },
  summary: "Professional profile summary.",
  workExperience: [], education: [{
    id: "edu-1", educationLevel: "Diploma", qualification: "IT Diploma",
    institution: "College", isCurrent: false,
  }],
  skills: [], certifications: [], projects: [], languages: [],
  personalAttributes: [], masterCv: null,
  confirmedAt: "2026-11-20T08:00:00.000Z", profileVersion: 2,
  ...overrides,
});

