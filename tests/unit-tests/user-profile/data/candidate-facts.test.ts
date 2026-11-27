import { describe, expect, it } from "vitest";
import { deriveCandidateFacts } from "@/thungatha-features/user-profile/server/candidate-facts";
import {
  calculateKnownEmploymentMonths,
  parseEmploymentMonth,
} from "@/thungatha-features/user-profile/server/employment-periods";
import type { UserProfileDto } from "@/thungatha-features/user-profile/server/user-profile-schema";

const profile = (overrides: Partial<UserProfileDto> = {}): UserProfileDto => ({
  displayName: "Candidate",
  nextRole: "Software Developer",
  personalDetails: {
    fullName: "Candidate",
    email: "candidate@example.com",
    phone: "0123456789",
    location: "Cape Town",
    country: "South Africa",
    residentialSuburb: "Observatory",
    residentialCity: "Cape Town",
    residentialProvince: "Western Cape",
  },
  summary: "Software developer with practical delivery experience.",
  workExperience: [
    {
      id: "work-1",
      jobTitle: "Developer",
      employer: "Company",
      startDate: "2020-01",
      endDate: "2022-01",
      isCurrent: false,
      description: "Built internal applications.",
      achievements: ["Automated reporting"],
    },
  ],
  education: [
    {
      id: "edu-1",
      educationLevel: "Diploma",
      qualification: "IT Software Development",
      institution: "College",
      isCurrent: false,
    },
  ],
  skills: ["TypeScript"],
  certifications: [
    {
      id: "cert-1",
      type: "professional-certification",
      name: "AZ-900",
      issuer: "Microsoft",
    },
  ],
  projects: [
    {
      id: "project-1",
      name: "Portal",
      role: "Developer",
      description: "Built a portal.",
    },
  ],
  languages: ["English"],
  personalAttributes: ["Problem solving"],
  masterCv: null,
  confirmedAt: "2026-11-20T10:00:00.000Z",
  profileVersion: 4,
  ...overrides,
});

describe("candidate fact derivation", () => {
  it("does not expose unconfirmed or incomplete Profiles", () => {
    expect(deriveCandidateFacts(profile({ confirmedAt: null }))).toBeNull();
    expect(deriveCandidateFacts(profile({ summary: null }))).toBeNull();
  });
  it("preserves confirmed source paths and derived experience references", () => {
    const facts = deriveCandidateFacts(profile(), "2026-11-20");
    expect(facts?.profileVersion).toBe(4);
    expect(facts?.knownEmploymentMonths).toBe(25);
    expect(facts?.employmentEvidenceRefs).toContain(
      "profile:workExperience[0].startDate",
    );
    expect(facts?.evidence.map((item) => item.sourcePath)).toContain(
      "workExperience[0].achievements[0]",
    );
    expect(facts?.evidence.map((item) => item.sourcePath)).toContain(
      "certifications[0].name",
    );
    expect(facts?.evidence.map((item) => item.sourcePath)).toContain(
      "projects[0].description",
    );
    expect(facts?.evidence.map((item) => item.sourcePath)).toContain(
      "personalDetails.residentialCity",
    );
    expect(facts?.targetRole).toBe("Software Developer");
  });
  it("keeps unknown employment periods linked to their actual Profile evidence", () => {
    const source = profile({
      workExperience: [
        {
          id: "work-2",
          jobTitle: "Analyst",
          employer: "Org",
          startDate: "unknown",
          isCurrent: false,
        },
      ],
    });
    const facts = deriveCandidateFacts(source, "2026-11-20");
    expect(facts?.knownEmploymentMonths).toBeNull();
    expect(facts?.unknownEmploymentPeriodRefs).toContain(
      "profile:workExperience[0].startDate",
    );
    expect(
      facts?.unknownEmploymentPeriodRefs.every((ref) =>
        facts.evidence.some((item) => item.id === ref),
      ),
    ).toBe(true);
  });
  it("counts merged employment months once and retains unknown periods", () => {
    const result = calculateKnownEmploymentMonths(
      [
        { startDate: "2020-01", endDate: "2021-01", isCurrent: false },
        { startDate: "2020-07", endDate: "2022-01", isCurrent: false },
        { startDate: "unknown", endDate: null, isCurrent: false },
      ],
      "2026-11-20",
    );
    expect(result.knownMonths).toBe(25);
    expect(result.unknownSourceIndexes).toEqual([2]);
  });
  it("parses only supported date formats and rejects invalid dates", () => {
    expect(parseEmploymentMonth("2024-02-29")).toBe(2024 * 12 + 1);
    expect(parseEmploymentMonth("Feb 2024")).toBe(2024 * 12 + 1);
    expect(parseEmploymentMonth("2024/02")).toBeNull();
    expect(parseEmploymentMonth("2023-02-29")).toBeNull();
  });
});
