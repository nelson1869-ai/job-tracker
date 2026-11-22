import { SOURCES, STATUSES, type JobApplication, type Source, type Status } from "./types";

// A backup file is plain JSON. The "app" and "version" fields let us recognise
// our own files and change the format later without breaking old backups.
interface BackupFile {
  app: "job-tracker";
  version: 1;
  exportedAt: string;
  applications: JobApplication[];
}

export function createBackup(applications: JobApplication[], now: Date = new Date()): string {
  const backup: BackupFile = {
    app: "job-tracker",
    version: 1,
    exportedAt: now.toISOString(),
    applications,
  };
  return JSON.stringify(backup, null, 2); // indented, so it is readable in a text editor
}

export type ParseResult =
  | { ok: true; applications: JobApplication[] }
  | { ok: false; error: string };

// Read a backup file's text and return clean applications, or a friendly error.
// A file can come from anywhere, so every field is checked before we trust it.
export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }

  // Accept our backup format, or a plain array of applications.
  const list = Array.isArray(data)
    ? data
    : isObject(data) && Array.isArray(data.applications)
      ? data.applications
      : null;
  if (!list) {
    return { ok: false, error: "This file does not look like a Job Tracker backup." };
  }

  const applications: JobApplication[] = [];
  for (const [index, item] of list.entries()) {
    const application = toApplication(item);
    if (!application) {
      return { ok: false, error: `Item ${index + 1} is missing a company or role.` };
    }
    applications.push(application);
  }
  return { ok: true, applications };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// "YYYY-MM-DD" or "" — anything else is dropped.
function date(value: unknown): string {
  const s = text(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

// Turn one unknown item into a valid JobApplication, or null if it is unusable.
function toApplication(item: unknown): JobApplication | null {
  if (!isObject(item)) return null;
  const company = text(item.company);
  const role = text(item.role);
  if (!company || !role) return null;

  const status = STATUSES.includes(item.status as Status) ? (item.status as Status) : "Applied";
  const source = SOURCES.includes(item.source as Source) ? (item.source as Source) : "Other";
  const now = new Date().toISOString();

  return {
    id: text(item.id) || crypto.randomUUID(),
    company,
    role,
    url: text(item.url),
    source,
    location: text(item.location),
    status,
    appliedOn: date(item.appliedOn),
    followUpOn: date(item.followUpOn),
    notes: text(item.notes),
    createdAt: text(item.createdAt) || now,
    updatedAt: text(item.updatedAt) || now,
  };
}
