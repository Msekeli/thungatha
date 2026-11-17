import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileWorkspaceMenu } from "@/components/layout/mobile-workspace-menu";
import { MobileWorkspaceBottomNav } from "@/components/layout/mobile-workspace-bottom-nav";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  SignInButton: ({
    children,
    fallbackRedirectUrl,
  }: {
    children: React.ReactNode;
    fallbackRedirectUrl?: string;
  }) => (
    <div data-sign-in-modal data-fallback={fallbackRedirectUrl}>
      {children}
    </div>
  ),
  SignUpButton: ({
    children,
    fallbackRedirectUrl,
  }: {
    children: React.ReactNode;
    fallbackRedirectUrl?: string;
  }) => (
    <div data-sign-up-modal data-fallback={fallbackRedirectUrl}>
      {children}
    </div>
  ),
}));

afterEach(cleanup);

describe("mobile signed-out authentication navigation", () => {
  it("renders modal sign-in and create-account controls in the menu", () => {
    render(
      <MobileWorkspaceMenu
        open
        configured
        isActive={() => false}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
    expect(document.querySelector('a[href="/sign-in"]')).toBeNull();
    expect(document.querySelector('a[href="/sign-up"]')).toBeNull();
  });

  it("renders protected bottom-nav actions as modal sign-in buttons", () => {
    render(
      <MobileWorkspaceBottomNav isActive={() => false} publicMode configured />,
    );

    expect(
      screen.getByRole("button", { name: "Sign in to access CV Studio" }),
    ).toBeTruthy();
    expect(document.querySelector('a[href="/cv-studio"]')).toBeNull();
  });
});
