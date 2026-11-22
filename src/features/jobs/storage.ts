import type { JobApplication } from "./types";

// All applications are saved in the browser's localStorage under this key.
// Nothing is sent to a server.
const STORAGE_KEY = "job-tracker:applications";

// React's useSyncExternalStore (see use-applications.ts) needs three things:
// subscribe, getSnapshot, and getServerSnapshot. They are defined below.
// Docs: https://react.dev/reference/react/useSyncExternalStore

const listeners = new Set<() => void>();
const EMPTY: JobApplication[] = [];

// getSnapshot must return the SAME array object while nothing changed,
// so we remember the last raw string and the array we parsed from it.
let lastRaw: string | null = null;
let lastParsed: JobApplication[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage can be blocked (e.g. some private modes)
  }
}

function parse(raw: string | null): JobApplication[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? (data as JobApplication[]) : EMPTY;
  } catch {
    return EMPTY; // broken JSON: start empty instead of crashing
  }
}

export function getSnapshot(): JobApplication[] {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parse(raw);
  }
  return lastParsed;
}

// During server rendering there is no localStorage, so the list starts empty.
export function getServerSnapshot(): JobApplication[] {
  return EMPTY;
}

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // The "storage" event fires when ANOTHER tab changes localStorage.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveApplications(applications: JobApplication[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch {
    alert("Could not save. Your browser storage may be full or blocked.");
    return;
  }
  // Tell components in THIS tab to re-read the list.
  listeners.forEach((listener) => listener());
}
