/*
 * Maps Clerk's variable and element names onto the Thungatha tokens and the
 * shared component classes (src/styles/components.css), so the sign-in modal,
 * sign-in and sign-up pages follow dark and light and use the same buttons
 * and inputs as the rest of the app. Passed to ClerkProvider in auth-providers.tsx.
 *
 * cssLayerName puts Clerk's own styles in a "clerk" layer. globals.css declares
 * that layer before "components", so our classes win without !important
 * (Clerk's documented setup for Tailwind v4).
 * No red exists in the design spec, so "danger" uses the warning colour.
 */
export const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "var(--th-btn)",
    colorPrimaryForeground: "var(--th-btn-fg)",
    colorBackground: "var(--th-panel)",
    colorForeground: "var(--th-fg)",
    colorMuted: "var(--th-panel-2)",
    colorMutedForeground: "var(--th-fg-muted)",
    colorInput: "var(--th-detail)",
    colorInputForeground: "var(--th-fg)",
    colorBorder: "var(--th-line)",
    colorRing: "var(--th-accent-text)",
    colorNeutral: "var(--th-fg)",
    colorSuccess: "var(--th-success)",
    colorWarning: "var(--th-warn)",
    colorDanger: "var(--th-warn)",
    colorModalBackdrop: "color-mix(in srgb, var(--th-page) 62%, transparent)",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    borderRadius: "var(--th-radius-control)",
  },
  elements: {
    modalBackdrop: { backdropFilter: "blur(6px)" },
    cardBox: "th-clerk-card",
    footer: "th-clerk-footer",
    formButtonPrimary: "th-btn th-btn-primary th-btn-lg th-btn-block",
    socialButtonsBlockButton: "th-btn th-btn-secondary th-btn-lg th-btn-block",
    formFieldInput: "th-input",
    dividerLine: { background: "var(--th-line)" },
    dividerText: { color: "var(--th-fg-muted)" },
    footerActionLink: { color: "var(--th-accent-text)", fontWeight: 500 },
  },
};
