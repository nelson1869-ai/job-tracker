"use client";

import { useSyncExternalStore } from "react";

// The theme lives on <html data-theme="light|dark"> (set before paint by layout.tsx).
// useSyncExternalStore watches that attribute, so the button always shows the truth.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const isDarkNow = () => document.documentElement.getAttribute("data-theme") === "dark";
const isDarkOnServer = () => false; // the server renders the light default

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, isDarkNow, isDarkOnServer);

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("job-tracker:theme", next);
    } catch {
      // storage blocked: the theme still changes for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-lg hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
