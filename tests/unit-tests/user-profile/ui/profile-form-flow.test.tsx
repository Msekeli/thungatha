import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileForm flow", () => {
  it("renders empty state and allows manual entry and saving a draft section", async () => {
    const savedProfile = {
      displayName: "Sam",
      nextRole: null,
      personalDetails: {
        fullName: "Sam",
        email: "sam@example.com",
        phone: "+27821234567",
        location: "Cape Town",
        country: "South Africa",
        residentialSuburb: "Gardens",
        residentialCity: "Cape Town",
        residentialProvince: "Western Cape",
        residentialPostalCode: null,
        linkedinUrl: null,
        portfolioUrl: null,
      },
      summary: null,
      workExperience: [],
      education: [],
      skills: ["TypeScript"],
      certifications: [],
      projects: [],
      languages: [],
      personalAttributes: [],
      masterCv: null,
      confirmedAt: null,
      profileVersion: 1,
    };
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return { ok: true, json: async () => ({ profile: savedProfile }) } as Response;
      }
      return { ok: true, json: async () => ({ profile: null }) } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);
    render(<ProfileForm />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Enter details manually" }),
    );

    fireEvent.click(screen.getByText("Personal details", { selector: "summary span span" }));

    const requiredFields: Record<string, string> = {
      "Full name": "Sam",
      "Email address": "sam@example.com",
      "Phone number": "+27821234567",
      "Professional location": "Cape Town",
      Country: "South Africa",
      "Residential area / suburb": "Gardens",
      "Residential city / town": "Cape Town",
      "Province / region": "Western Cape",
    };

    for (const [label, value] of Object.entries(requiredFields)) {
      fireEvent.change(await screen.findByLabelText(new RegExp(`^${label}`)), {
        target: { value },
      });
    }

    fireEvent.click(screen.getAllByRole("button", { name: "Save section" })[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Changes saved\. Your profile remains a draft/),
      ).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
