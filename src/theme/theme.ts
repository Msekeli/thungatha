"use client";
import { createTheme } from "@mui/material/styles";
import tokens from "./tokens.json";

/*
 * MUI theme, built from src/theme/tokens.json (the same file that generates
 * the CSS variables), so colours can never drift. MUI picks the names for its
 * own variables (--mui-palette-*) and classes (.Mui*); we feed it our values
 * and keep our own names (--th-*) for everything we write.
 */
type Mode = keyof typeof tokens;
const palette = (m: Mode) => {
  const t = tokens[m];
  return {
    primary: { main: t.btn, contrastText: t["btn-fg"] },
    success: { main: t.success, contrastText: t["btn-fg"] },
    warning: { main: t.warn, contrastText: t["btn-fg"] },
    background: { default: t.page, paper: t.panel },
    text: { primary: t.fg, secondary: t["fg-muted"] },
    divider: t.line,
  };
};

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data-theme" },
  defaultColorScheme: "dark",
  colorSchemes: {
    dark: { palette: palette("dark") },
    light: { palette: palette("light") },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    fontSize: 13,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    h1: { fontSize: 18, lineHeight: "24px", fontWeight: 500 }, // Title
    h2: { fontSize: 15, lineHeight: "22px", fontWeight: 500 }, // Job title
    h3: { fontSize: 13, lineHeight: "20px", fontWeight: 500 }, // Panel heading
    subtitle1: { fontSize: 15, lineHeight: "22px", fontWeight: 500 },
    body1: { fontSize: 13, lineHeight: "20px", fontWeight: 400 }, // Control
    body2: { fontSize: 12, lineHeight: "18px", fontWeight: 400 }, // Detail
    caption: { fontSize: 11, lineHeight: "16px", fontWeight: 400 }, // Tag
    button: {
      fontSize: 13,
      lineHeight: "20px",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 36, borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", border: "1px solid var(--th-line)" },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "var(--th-nav)",
          color: "var(--th-nav-text)",
          border: 0,
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontSize: 12 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8, background: "var(--th-panel)" },
      },
    },
  },
});

export default theme;
