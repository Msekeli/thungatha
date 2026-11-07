"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      document.documentElement.setAttribute(
        "data-theme",
        event.newValue === "light" ? "light" : "dark",
      );
    }
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

  function setTheme(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Theme still changes for this visit. */
    }
  }

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`th-theme-toggle inline-flex h-10 w-fit shrink-0 items-center gap-0.5 rounded-md border border-[var(--th-workspace-toggle-border)] bg-transparent p-1 transition-colors max-[700px]:h-8 max-[700px]:gap-0 max-[700px]:p-0.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        title="Light theme"
        className={`inline-flex h-7 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-semibold max-[700px]:h-6 max-[700px]:gap-1 max-[700px]:px-1.5 max-[700px]:text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent sm:h-8 sm:px-2.5 sm:text-sm max-[700px]:h-6 ${
          theme === "light"
            ? "border border-[var(--th-accent-on-navy)] bg-[var(--th-workspace-nav-active-bg)] text-[var(--th-accent-on-navy)]"
            : "border border-transparent text-[var(--th-workspace-toggle-text)] hover:bg-[var(--th-workspace-nav-active-bg)] hover:text-[var(--th-accent-on-navy)]"
        }`}
      >
        <Sun
          size={15}
          className="max-[700px]:h-3.5 max-[700px]:w-3.5"
          aria-hidden="true"
        />
        <span>Light</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        title="Dark theme"
        className={`inline-flex h-7 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-semibold max-[700px]:h-6 max-[700px]:gap-1 max-[700px]:px-1.5 max-[700px]:text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent sm:h-8 sm:px-2.5 sm:text-sm ${
          theme === "dark"
            ? "border border-[var(--th-accent-on-navy)] bg-[var(--th-workspace-nav-active-bg)] text-[var(--th-accent-on-navy)]"
            : "border border-transparent text-[var(--th-workspace-toggle-text)] hover:bg-[var(--th-nav-active-bg)] hover:text-[var(--th-accent-on-navy)]"
        }`}
      >
        <Moon
          size={15}
          className="max-[700px]:h-3.5 max-[700px]:w-3.5"
          aria-hidden="true"
        />
        <span>Dark</span>
      </button>
    </div>
  );
}
