"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, saveApplications, subscribe } from "./storage";
import type { JobApplication, JobApplicationInput } from "./types";

// One hook for everything: the current list, plus add / update / delete.
export function useApplications() {
  const applications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function addApplication(input: JobApplicationInput) {
    const now = new Date().toISOString();
    const application: JobApplication = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    // Newest first.
    saveApplications([application, ...getSnapshot()]);
  }

  function updateApplication(id: string, input: JobApplicationInput) {
    const now = new Date().toISOString();
    saveApplications(
      getSnapshot().map((application) =>
        application.id === id ? { ...application, ...input, updatedAt: now } : application,
      ),
    );
  }

  function deleteApplication(id: string) {
    saveApplications(getSnapshot().filter((application) => application.id !== id));
  }

  return { applications, addApplication, updateApplication, deleteApplication };
}
