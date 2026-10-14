import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/*
 * The one button for Thungatha's own UI. Styles live in components.css
 * (.th-btn*), so Clerk's buttons use the exact same classes via
 * src/theme/clerk-appearance.ts. Do not hand-write button classes elsewhere.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children?: ReactNode;
};

export function buttonClass({
  variant = "secondary",
  size = "md",
  block = false,
  className = "",
}: Pick<Shared, "variant" | "size" | "block" | "className">) {
  return [
    "th-btn",
    `th-btn-${variant}`,
    `th-btn-${size}`,
    block ? "th-btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

// Renders a <button>. Extra props (onClick, disabled, ...) are passed through,
// so it works as the single child of Clerk's SignInButton / SignUpButton.
export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: Shared & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, className })}
      {...props}
    />
  );
}

// Same look, rendered as a Next.js <Link> for navigation.
export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: Shared & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={buttonClass({ variant, size, block, className })}
      {...props}
    />
  );
}
