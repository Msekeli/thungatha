/*
 * Clerk chooses its own variable names (colorPrimary, colorBackground, ...).
 * This maps them onto our tokens using var(), which Clerk supports, so the
 * sign-in and account screens follow dark and light automatically.
 * Use: <ClerkProvider appearance={clerkAppearance}>
 * No red exists in the design spec, so "danger" uses the warning colour for now.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--th-btn)',
    colorBackground: 'var(--th-panel)',
    colorForeground: 'var(--th-fg)',
    colorMuted: 'var(--th-panel-2)',
    colorInput: 'var(--th-panel)',
    colorBorder: 'var(--th-line)',
    colorRing: 'var(--th-accent-text)',
    colorNeutral: 'var(--th-fg)',
    colorSuccess: 'var(--th-success)',
    colorWarning: 'var(--th-warn)',
    colorDanger: 'var(--th-warn)',
    fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
    borderRadius: 'var(--th-radius-control)',
  },
};
