"use client";

import { useRef, useState } from "react";
import { createBackup, parseBackup } from "./backup";
import { todayString } from "./filters";
import type { JobApplication } from "./types";

interface BackupControlsProps {
  applications: JobApplication[];
  onImport: (applications: JobApplication[]) => void;
}

// Export: download all applications as a .json file.
// Import: pick a .json file and replace the current list with it.
export function BackupControls({ applications, onImport }: BackupControlsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function exportFile() {
    // Make a file in memory (Blob), give it a temporary URL, and click a hidden link.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
    const blob = new Blob([createBackup(applications)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-tracker-backup-${todayString()}.json`;
    link.click();
    URL.revokeObjectURL(url); // free the memory
    setMessage(`Exported ${applications.length} application(s).`);
  }

  async function importFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so choosing the same file again still triggers onChange
    if (!file) return;

    const result = parseBackup(await file.text());
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    const ok = confirm(
      `Replace your ${applications.length} application(s) with the ${result.applications.length} in this file?`,
    );
    if (!ok) return;
    onImport(result.applications);
    setMessage(`Imported ${result.applications.length} application(s).`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={exportFile}
        disabled={applications.length === 0}
        className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Export backup
      </button>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Import backup
      </button>
      {/* The real file picker is hidden; the button above opens it. */}
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        onChange={importFile}
        className="hidden"
        aria-label="Choose a backup file"
      />
      {/* role="status" makes screen readers announce the result. */}
      <p role="status" className="text-zinc-600 dark:text-zinc-400">
        {message}
      </p>
    </div>
  );
}
