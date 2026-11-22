"use client";

import { useState } from "react";
import { ApplicationForm } from "./application-form";
import { ApplicationList } from "./application-list";
import { countByStatus, dueFollowUps, filterApplications, todayString, type StatusFilter as Filter } from "./filters";
import { FollowUpBanner } from "./follow-up-banner";
import { StatusFilter } from "./status-filter";
import type { JobApplication } from "./types";
import { useApplications } from "./use-applications";

// The main screen: follow-up reminders, the form, then the filtered list.
// Clicking "Edit" swaps the form into edit mode for that application.
export function JobTracker() {
  const { applications, addApplication, updateApplication, deleteApplication } = useApplications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  // Everything below is calculated from the list on every render (no extra state).
  const editing = applications.find((application) => application.id === editingId);
  const counts = countByStatus(applications);
  const visible = filterApplications(applications, statusFilter, query);
  const due = dueFollowUps(applications, todayString());

  function startEditing(id: string) {
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // "Done" on a reminder: keep everything, just clear the follow-up date.
  function markFollowUpDone(application: JobApplication) {
    updateApplication(application.id, { ...application, followUpOn: "" });
  }

  return (
    <div className="space-y-10">
      <FollowUpBanner due={due} onDone={markFollowUpDone} onEdit={startEditing} />

      <section aria-labelledby="form-heading">
        <h2 id="form-heading" className="mb-4 text-lg font-semibold">
          {editing ? `Edit: ${editing.role} at ${editing.company}` : "Add an application"}
        </h2>
        <ApplicationForm
          // A new key makes React start a fresh form when we switch between add and edit.
          key={editing?.id ?? "new"}
          initial={editing}
          onSave={(input) => {
            if (editing) {
              updateApplication(editing.id, input);
              setEditingId(null);
            } else {
              addApplication(input);
            }
          }}
          onCancel={editing ? () => setEditingId(null) : undefined}
        />
      </section>

      <section aria-labelledby="list-heading" className="space-y-4">
        <h2 id="list-heading" className="text-lg font-semibold">
          My applications ({applications.length})
        </h2>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search company, role, location, notes…"
          aria-label="Search applications"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <StatusFilter value={statusFilter} counts={counts} onChange={setStatusFilter} />

        <ApplicationList
          applications={visible}
          onEdit={startEditing}
          onDelete={(id) => {
            if (id === editingId) setEditingId(null);
            deleteApplication(id);
          }}
          emptyMessage={
            applications.length === 0
              ? undefined // use the default "No applications yet" text
              : "No applications match this filter or search."
          }
        />
      </section>
    </div>
  );
}
