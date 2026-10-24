import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ProfileForm } from "@/thungatha-features/user-profile/ui/profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileForm error recovery", () => {
  it("retries loading after recoverable failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ profile: null }), { status: 200 }),
      );

    vi.stubGlobal("fetch", fetchMock);
    render(<ProfileForm />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Check your connection");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("button", { name: "Enter details manually" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows error alert when save fails due to network error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ profile: null }), { status: 200 }))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    vi.stubGlobal("fetch", fetchMock);
    render(<ProfileForm initialMode="edit" />);

    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "Sam" } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Check your connection and try again");
  });

  it("shows API error message when rejected by server", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ profile: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Invalid profile" }), { status: 400 }));

    vi.stubGlobal("fetch", fetchMock);
    render(<ProfileForm initialMode="edit" />);

    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "Sam" } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid profile");
  });
});
