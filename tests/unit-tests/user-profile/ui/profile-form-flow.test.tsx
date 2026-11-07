import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileForm flow", () => {
  it("renders empty state and allows manual entry and saving a draft", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: null }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            profile: {
              displayName: "Sam",
              nextRole: null,
              personalDetails: {
                fullName: "Sam",
                email: "sam@example.com",
                phone: null,
                location: null,
                country: null,
                residentialSuburb: null,
                residentialCity: null,
                residentialProvince: null,
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
            },
          }),
          { status: 200 },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);
    render(<ProfileForm />);

    const manualBtn = await screen.findByRole("button", { name: "Enter details manually" });
    fireEvent.click(manualBtn);

    const nameInput = await screen.findByLabelText("Full name");
    fireEvent.change(nameInput, { target: { value: "Sam" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => {
      expect(screen.getByText(/Draft saved\./)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Save draft" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
