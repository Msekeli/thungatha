import { describe, expect, it } from "vitest";
import { deriveCandidateFacts } from "@/thungatha-features/job-discovery/server/candidate-facts";
import { profile } from "./candidate-facts-fixture";


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
        { id: "a", jobTitle: "Developer", employer: "A", startDate: "2020-01", endDate: "2021-12", isCurrent: false },
        { id: "b", jobTitle: "Consultant", employer: "B", startDate: "2021-01", endDate: "2022-12", isCurrent: false },
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

  it("rejects impossible calendar dates instead of counting them", () => {
    const facts = deriveCandidateFacts(profile({
      workExperience: [{
        id: "bad-date", jobTitle: "Engineer", employer: "A",
        startDate: "2020-02-31", endDate: "2021-01", isCurrent: false,
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
