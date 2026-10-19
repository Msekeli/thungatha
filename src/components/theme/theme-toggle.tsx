"use client";

import { useSyncExternalStore } from "react";
import Switch from "@mui/material/Switch";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      document.documentElement.setAttribute("data-theme", event.newValue === "light" ? "light" : "dark");
    }
  };
  window.addEventListener("storage", onStorage);
  return () => { observer.disconnect(); window.removeEventListener("storage", onStorage); };
}

const getSnapshot = (): Theme => document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
const getServerSnapshot = (): Theme | null => null;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme !== "light";
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* Theme still changes for this visit. */ }
  }

  return (
    <Switch
      checked={isDark}
      onChange={toggle}
      inputProps={{ "aria-label": label, title: label }}
      className={className}
      icon={<span className="th-theme-switch-sun" aria-hidden="true">☼</span>}
      checkedIcon={<span className="th-theme-switch-sun" aria-hidden="true">☼</span>}
      sx={{
        width: 98, height: 44, p: "5px", overflow: "visible",
        "& .MuiSwitch-switchBase": { p: "5px", color: "var(--th-fg)", transitionDuration: "180ms" },
        "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(54px)", color: "#fff" },
        "& .MuiSwitch-thumb": { width: 32, height: 32, boxShadow: "0 0 0 2px var(--th-line), 0 0 12px color-mix(in srgb, var(--th-accent) 55%, transparent)" },
        "& .MuiSwitch-track": { border: "1px solid var(--th-line)", borderRadius: 24, opacity: 1, backgroundColor: "var(--th-panel)" },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--th-panel)", opacity: 1 },
        "& .th-theme-switch-sun": { display: "grid", placeItems: "center", width: 28, height: 28, color: "var(--th-accent)", fontSize: 25, lineHeight: 1 },
      }}
    />
  );
}
