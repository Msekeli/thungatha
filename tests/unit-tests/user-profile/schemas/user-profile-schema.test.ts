import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/thungatha-features/user-profile/server/user-profile-schema";

describe("updateProfileSchema validation", () => {
  it("accepts a legacy displayName-only payload", () => {
    const result = updateProfileSchema.safeParse({ displayName: "Lerato" });
    expect(result.success).toBe(true);
  });

  it("rejects client-supplied identity fields", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "Lerato",
      userId: "user_injected",
    });
    expect(result.success).toBe(false);
  });

  it("validates all seven sections and metadata", () => {
    const fullProfile = {
      personalDetails: {
        fullName: "Lerato Naidoo",
        email: "lerato.naidoo@example.com",
        phone: "+27 82 123 4567",
        location: "Cape Town, South Africa",
        linkedinUrl: "https://linkedin.com/in/lerato-naidoo",
        portfolioUrl: "https://lerato-example.dev",
      },
      summary: "Software engineer with 4 years experience.",
      workExperience: [
        {
          id: "exp-1",
          jobTitle: "Frontend Engineer",
          employer: "Brightloop",
          startDate: "Mar 2022",
          isCurrent: true,
        },
      ],
      education: [
        {
          id: "edu-1",
          qualification: "BSc CS",
          institution: "Westbrook",
        },
      ],
      skills: ["React", "TypeScript"],
      certifications: [{ id: "cert-1", name: "Cloud Fundamentals" }],
      projects: [{ id: "proj-1", name: "Budget Tracker" }],
      masterCv: {
        filename: "Lerato_CV.pdf",
        fileSize: 188416,
        uploadedAt: "2026-10-24T08:00:00.000Z",
      },
      confirmedAt: "2026-10-24T08:30:00.000Z",
    };

    const result = updateProfileSchema.safeParse(fullProfile);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email formats in personal details", () => {
    const result = updateProfileSchema.safeParse({
      personalDetails: { email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });
});
