import { describe, expect, it } from "vitest";
import { parseCvText } from "@/thungatha-features/user-profile/server/cv-extraction";

describe("PDF CV text parsing", () => {
  it("groups a linear CV experience row when title, employer and dates are separate cells", () => {
    const result = parseCvText([
      "Msekeli Mkwibiso",
      "msekeli@example.com",
      "PROFESSIONAL EXPERIENCE",
      "Web Developer (.NET)",
      "Ardagh Group (via EXL Services)",
      "Oct 2024 – Nov 2025",
      "Migrated an internal application to Blazor.",
      "EDUCATION",
      "NQF Level 5: IT Systems Development June 2022 – May 2023",
      "CTU Training Solutions",
    ].join("\n"));

    expect(result.fullName).toBe("Msekeli Mkwibiso");
    expect(result.email).toBe("msekeli@example.com");
    expect(result.workExperience[0]).toMatchObject({
      jobTitle: "Web Developer (.NET)",
      employer: "Ardagh Group (via EXL Services)",
      startDate: "2024-10",
      endDate: "2025-11",
    });
    expect(result.education[0]).toMatchObject({
      qualification: "NQF Level 5: IT Systems Development",
      institution: "CTU Training Solutions",
    });
  });

  it("groups a two-column CV experience row and education dates", () => {
    const result = parseCvText([
      "Siphumle Mkwibiso",
      "WORK EXPERIENCE",
      "Night Auditor",
      "Sanctuary Mandela Hotel (Five Star) 2021 – Current",
      "Reconcile accounts and investigate out-of-balance accounts",
      "EDUCATION",
      "Walter Sisulu University",
      "National Diploma in Internal Auditing",
      "2014 – 2020",
      "Nomaheya Senior Secondary School",
      "National Senior Certificate (Matric)",
      "1999 – 2002",
      "EXPERTISE",
      "Negotiation",
      "Critical Thinking",
    ].join("\n"));

    expect(result.workExperience[0]).toMatchObject({
      jobTitle: "Night Auditor",
      employer: "Sanctuary Mandela Hotel (Five Star)",
      isCurrent: true,
    });
    expect(result.education[0]).toMatchObject({
      qualification: "National Diploma in Internal Auditing",
      institution: "Walter Sisulu University",
    });
    expect(result.skills).toContain("Negotiation");
  });
});
