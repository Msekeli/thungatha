/*
 * Theme settings shared by the layout (pre-paint script) and the toggle.
 * The theme lives in <html data-theme="dark|light">, which tokens.css,
 * Tailwind's dark:/light: variants and Clerk (via var()) follow.
 * To follow the visitor's operating system on a first visit instead of dark,
 * change DEFAULT_THEME handling in themeInitScript below.
 */
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "thungatha-theme";
export const DEFAULT_THEME: Theme = "dark";

// Runs before first paint so there is no flash of the wrong theme.
export const themeInitScript = `(function(){var t="${DEFAULT_THEME}";try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.setAttribute("data-theme",t)})();`;
