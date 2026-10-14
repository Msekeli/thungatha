import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProfileForm } from "./profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileForm", () => {
  it("loads the profile and reports a successful save", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: { displayName: null } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: { displayName: "Sam" } }), {
          status: 200,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileForm />);
    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "Sam" } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Profile saved."),
    );
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ displayName: "Sam" }),
      }),
    );
  });

  it("shows a recoverable error when the profile cannot load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 503 })),
    );

    render(<ProfileForm />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Refresh to try again",
    );
  });
});
