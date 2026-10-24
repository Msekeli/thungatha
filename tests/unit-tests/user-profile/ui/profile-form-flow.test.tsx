import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileForm flow", () => {
  it("renders empty state and allows manual entry and saving", async () => {
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
              personalDetails: { fullName: "Sam", email: "sam@example.com" },
              workExperience: [],
              education: [],
              skills: ["TypeScript"],
              certifications: [],
              projects: [],
              masterCv: null,
              confirmedAt: "2026-10-24T10:00:00.000Z",
            },
          }),
          { status: 200 },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);
    render(<ProfileForm />);

    const manualBtn = await screen.findByRole("button", { name: "Enter details manually" });
    fireEvent.click(manualBtn);

    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "Sam" } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Profile saved.");
    });
    expect(await screen.findByRole("button", { name: "Edit profile" })).toBeInTheDocument();
  });
});
