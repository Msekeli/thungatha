import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

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

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Profile saved.");
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ displayName: "Sam" }),
      }),
    );
  });

  it("retries loading the profile after a recoverable failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: { displayName: "Sam" } }), {
          status: 200,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileForm />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection and try again",
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByLabelText("Display name")).toHaveValue("Sam");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows a safe message when saving fails due to a network error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: { displayName: "Sam" } }), {
          status: 200,
        }),
      )
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileForm />);

    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "New name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t save your changes. Check your connection and try again.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("Failed to fetch");
  });

  it("shows the API error when saving is rejected by the server", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: { displayName: "Sam" } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Display name is invalid" }), {
          status: 400,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileForm />);

    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "New name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Display name is invalid",
    );
  });
});
