import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileForm saved view", () => {
  it("renders saved profile and allows editing", async () => {
    const profileData = {
      displayName: "Lerato Naidoo",
      nextRole: null,
      personalDetails: {
        fullName: "Lerato Naidoo",
        email: "lerato@example.com",
        phone: "+27821234567",
        location: "Cape Town",
        country: "South Africa",
        residentialSuburb: "Gardens",
        residentialCity: "Cape Town",
        residentialProvince: "Western Cape",
        residentialPostalCode: null,
        linkedinUrl: null,
        portfolioUrl: "https://lerato.dev",
      },
      summary: "Software engineer in React",
      workExperience: [
        { id: "1", jobTitle: "Frontend Dev", employer: "Studio", startDate: "2022", isCurrent: true, achievements: [] },
      ],
      education: [
        { id: "2", educationLevel: "Degree", qualification: "BSc CS", institution: "Univ", endDate: "2020", isCurrent: false },
      ],
      skills: ["React", "TypeScript"],
      certifications: [],
      projects: [],
      languages: [],
      personalAttributes: [],
      masterCv: null,
      confirmedAt: "2026-10-24T08:00:00.000Z",
      profileVersion: 1,
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ profile: profileData }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileForm />);

    expect(await screen.findByText("Lerato Naidoo")).toBeInTheDocument();
    expect(screen.getByText(/Confirmed/)).toBeInTheDocument();
    expect(screen.getByText("Frontend Dev · Studio")).toBeInTheDocument();
    expect(screen.getByText("BSc CS")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    expect(await screen.findByLabelText("Full name")).toHaveValue("Lerato Naidoo");
  });
});
