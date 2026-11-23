"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/features/ui/confirm-dialog";
import { createBackup, parseBackup } from "./backup";
import { todayString } from "./filters";
import type { JobApplication } from "./types";

interface BackupControlsProps {
  applications: JobApplication[];
  onImport: (applications: JobApplication[]) => void;
  onNotify: (message: string, tone: "success" | "error") => void;
}

const button =
  "h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800";

// Export: download all applications as a .json file.
// Import: pick a .json file, check it, then ask before replacing the list.
export function BackupControls({ applications, onImport, onNotify }: BackupControlsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  // The checked list waiting for the user to confirm the replace.
  const [pending, setPending] = useState<JobApplication[] | null>(null);

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
    onNotify(`Exported ${applications.length} application(s).`, "success");
  }

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so choosing the same file again still triggers onChange
    if (!file) return;

    // Everything is validated BEFORE we ask, so a bad file never touches your data.
    const result = parseBackup(await file.text());
    if (!result.ok) {
      onNotify(result.error, "error");
      return;
    }
    setPending(result.applications);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportFile} disabled={applications.length === 0} className={button}>
        Export backup
      </button>
      <button type="button" onClick={() => fileInput.current?.click()} className={button}>
        Import backup
      </button>
      {/* The real file picker is hidden; the button above opens it. */}
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        onChange={chooseFile}
        className="hidden"
        aria-label="Choose a backup file"
      />

      <ConfirmDialog
        open={pending !== null}
        title="Replace your applications?"
        message={`This replaces your ${applications.length} application(s) with the ${pending?.length ?? 0} in the backup file. Export a backup first if you want to keep the current list.`}
        confirmLabel="Replace"
        danger
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onImport(pending);
          setPending(null);
        }}
      />
    </div>
  );
}
