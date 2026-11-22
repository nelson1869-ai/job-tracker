"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, saveApplications, subscribe } from "./storage";
import type { JobApplication, JobApplicationInput } from "./types";

// One hook for everything: the current list, plus add / update / delete / undo.
// Every change returns true if it was saved, false if the browser refused
// (storage full or blocked), so the screen can show the right message.
export function useApplications() {
  const applications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function addApplication(input: JobApplicationInput): boolean {
    const now = new Date().toISOString();
    const application: JobApplication = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    return saveApplications([application, ...getSnapshot()]); // newest first
  }

  function updateApplication(id: string, input: JobApplicationInput): boolean {
    const now = new Date().toISOString();
    return saveApplications(
      getSnapshot().map((application) =>
        application.id === id ? { ...application, ...input, id, updatedAt: now } : application,
      ),
    );
  }

  // Returns what was removed and where, so "Undo" can put it back in the same place.
  function deleteApplication(id: string): { removed: JobApplication; index: number } | null {
    const list = getSnapshot();
    const index = list.findIndex((application) => application.id === id);
    if (index === -1) return null;
    const ok = saveApplications(list.filter((application) => application.id !== id));
    return ok ? { removed: list[index], index } : null;
  }

  function restoreApplication(application: JobApplication, index: number): boolean {
    const list = [...getSnapshot()];
    list.splice(Math.min(index, list.length), 0, application);
    return saveApplications(list);
  }

  // Used by "Import backup": the file's list replaces the current one.
  function replaceAll(next: JobApplication[]): boolean {
    return saveApplications(next);
  }

  return {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    restoreApplication,
    replaceAll,
  };
}
