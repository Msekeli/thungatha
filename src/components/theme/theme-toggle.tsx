"use client";

import { useSyncExternalStore } from "react";
import Switch from "@mui/material/Switch";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { themeToggleStyles } from "./theme-toggle-styles";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY)
      document.documentElement.setAttribute(
        "data-theme",
        event.newValue === "light" ? "light" : "dark",
      );
  };
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
const getServerSnapshot = (): Theme | null => null;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme !== "light";
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Theme still changes for this visit. */
    }
  }

  return (
    <Switch
      checked={isDark}
      onChange={toggle}
      slotProps={{ input: { "aria-label": label, title: label } }}
      className={className}
      icon={
        <span className="th-theme-switch-moon" aria-hidden="true">
          ☾
        </span>
      }
      checkedIcon={
        <span className="th-theme-switch-sun" aria-hidden="true">
          ☼
        </span>
      }
      sx={themeToggleStyles}
    />
  );
}
