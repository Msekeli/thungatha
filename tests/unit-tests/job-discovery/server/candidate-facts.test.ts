import { describe, expect, it } from "vitest";
import { deriveCandidateFacts } from "@/thungatha-features/job-discovery/server/candidate-facts";
import type { UserProfileDto } from "@/thungatha-features/user-profile/server/user-profile-schema";

const profile = (overrides: Partial<UserProfileDto> = {}): UserProfileDto => ({
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
    institution: "College",
  }],
  skills: [], certifications: [], projects: [], languages: [],
  personalAttributes: [], masterCv: null,
  confirmedAt: "2026-11-20T08:00:00.000Z", profileVersion: 2,
  ...overrides,
});

describe("deriveCandidateFacts", () => {
  it("does not derive facts from an unconfirmed Profile", () => {
    expect(deriveCandidateFacts(profile({ confirmedAt: null }), "2026-11-20")).toBeNull();
  });

  it("does not derive facts from an incomplete Profile", () => {
    const candidate = profile();
    candidate.personalDetails.email = null;
    expect(deriveCandidateFacts(candidate, "2026-11-20")).toBeNull();
  });

  it("merges overlapping employment periods before counting months", () => {
    const facts = deriveCandidateFacts(profile({
      workExperience: [
        { id: "a", jobTitle: "Developer", employer: "A", startDate: "Jan 2020", endDate: "Dec 2021" },
        { id: "b", jobTitle: "Consultant", employer: "B", startDate: "Jan 2021", endDate: "Dec 2022" },
      ],
    }), "2026-11-20");
    expect(facts?.knownEmploymentMonths).toBe(36);
    expect(facts?.employment).toHaveLength(2);
  });

  it("keeps unparseable employment dates unknown", () => {
    const facts = deriveCandidateFacts(profile({
      workExperience: [{
        id: "a", jobTitle: "Developer", employer: "A",
        startDate: "early 2020", endDate: "Present", isCurrent: true,
      }],
    }), "2026-11-20");
    expect(facts?.employment).toHaveLength(0);
    expect(facts?.unknownEmploymentSourcePaths).toEqual(["workExperience[0]"]);
  });

  it("uses exact canonical skill aliases without stripping punctuation", () => {
    const facts = deriveCandidateFacts(profile({ skills: ["C sharp", "C++", "DotNet", "React Native"] }), "2026-11-20");
    expect(facts?.skills.map((skill) => skill.canonical)).toEqual(["C#", "C++", ".NET", null]);
  });

  it("keeps academic education and certifications in separate collections", () => {
    const facts = deriveCandidateFacts(profile({
      nextRole: "Frontend Developer",
      languages: ["English", "isiXhosa"],
      certifications: [{ id: "cert-1", type: "professional-certification", name: "AWS Certified Cloud Practitioner", issuer: "Amazon" }],
    }), "2026-11-20");
    expect(facts?.education[0].qualification).toBe("IT Diploma");
    expect(facts?.certifications[0].name).toBe("AWS Certified Cloud Practitioner");
    expect(facts?.nextRole).toBe("Frontend Developer");
    expect(facts?.languages.map((language) => language.value)).toEqual(["English", "isiXhosa"]);
  });
});
