"use client";

import { useState } from "react";
import { ApplicationForm } from "./application-form";
import { ApplicationList } from "./application-list";
import { useApplications } from "./use-applications";

// The main screen: a form at the top, the list below.
// Clicking "Edit" on a list item swaps the top form into edit mode.
export function JobTracker() {
  const { applications, addApplication, updateApplication, deleteApplication } = useApplications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = applications.find((application) => application.id === editingId);

  return (
    <div className="space-y-10">
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

      <section aria-labelledby="list-heading">
        <h2 id="list-heading" className="mb-4 text-lg font-semibold">
          My applications ({applications.length})
        </h2>
        <ApplicationList
          applications={applications}
          onEdit={(id) => {
            setEditingId(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={(id) => {
            if (id === editingId) setEditingId(null);
            deleteApplication(id);
          }}
        />
      </section>
    </div>
  );
}
