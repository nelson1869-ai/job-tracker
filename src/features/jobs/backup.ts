import type { JobApplication } from "./types";
import { normalizeApplication } from "./validation";

// A backup file is plain JSON. The "app" and "version" fields let us recognise
// our own files and change the format later without breaking old backups.
// Version 2 added salary, employment type, workplace, contact, interview date,
// resume version, and next action. Version 1 files still import fine: the new
// fields simply start empty.
interface BackupFile {
  app: "job-tracker";
  version: 2;
  exportedAt: string;
  applications: JobApplication[];
}

export function createBackup(applications: JobApplication[], now: Date = new Date()): string {
  const backup: BackupFile = {
    app: "job-tracker",
    version: 2,
    exportedAt: now.toISOString(),
    applications,
  };
  return JSON.stringify(backup, null, 2); // indented, so it is readable in a text editor
}

export type ParseResult =
  | { ok: true; applications: JobApplication[] }
  | { ok: false; error: string };

// Read a backup file's text and return clean applications, or a friendly error.
// Unlike loading from localStorage, an import is all-or-nothing: if one item is
// broken we stop and say which one, so the user's current data is never replaced
// by a half-read file.
export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }

  // Accept our backup format, or a plain array of applications.
  const list =
    Array.isArray(data)
      ? data
      : typeof data === "object" && data !== null && Array.isArray((data as { applications?: unknown }).applications)
        ? (data as { applications: unknown[] }).applications
        : null;
  if (!list) {
    return { ok: false, error: "This file does not look like a Job Tracker backup." };
  }

  const applications: JobApplication[] = [];
  const seen = new Set<string>();
  for (const [index, item] of list.entries()) {
    const application = normalizeApplication(item);
    if (!application) {
      return { ok: false, error: `Item ${index + 1} is missing a company or role.` };
    }
    if (seen.has(application.id)) application.id = crypto.randomUUID(); // fix duplicate ids
    seen.add(application.id);
    applications.push(application);
  }
  return { ok: true, applications };
}
