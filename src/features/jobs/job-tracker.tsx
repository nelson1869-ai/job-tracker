"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/features/ui/confirm-dialog";
import { Modal } from "@/features/ui/modal";
import { Toasts, useToasts } from "@/features/ui/toasts";
import { ApplicationForm } from "./application-form";
import { ApplicationList } from "./application-list";
import { BackupControls } from "./backup-controls";
import { Dashboard } from "./dashboard";
import {
  SORT_OPTIONS,
  dashboardStats,
  dueFollowUps,
  filterApplications,
  sortApplications,
  todayString,
  upcomingInterviews,
  type SortKey,
  type StatusFilter as Filter,
} from "./filters";
import { StatusFilter } from "./status-filter";
import type { JobApplication, JobApplicationInput } from "./types";
import { useApplications } from "./use-applications";

const SAVE_FAILED = "Could not save. Your browser storage may be full or blocked.";

// The main screen: toolbar, dashboard, then the searchable list.
// The form opens in a modal for both "Add" and "Edit".
export function JobTracker() {
  const { applications, addApplication, updateApplication, deleteApplication, restoreApplication, replaceAll } =
    useApplications();
  const { toasts, notify, dismiss } = useToasts();

  // UI state only. The applications themselves live in one place (localStorage).
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  // Everything below is calculated from the list on every render (no copies in state).
  const today = todayString();
  const editing = applications.find((application) => application.id === editingId);
  const deleting = applications.find((application) => application.id === deletingId);
  const stats = dashboardStats(applications, today);
  const due = dueFollowUps(applications, today);
  const interviews = upcomingInterviews(applications, today);
  const recent = sortApplications(applications, "newest").slice(0, 5);
  const visible = sortApplications(filterApplications(applications, statusFilter, query), sortKey);

  function openAdd() {
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  function save(input: JobApplicationInput) {
    const ok = editing ? updateApplication(editing.id, input) : addApplication(input);
    if (!ok) {
      notify({ message: SAVE_FAILED, tone: "error" });
      return; // keep the form open so nothing typed is lost
    }
    notify({ message: editing ? "Changes saved." : `Added ${input.role} at ${input.company}.`, tone: "success" });
    closeForm();
  }

  function confirmDelete() {
    if (!deletingId) return;
    const result = deleteApplication(deletingId);
    setDeletingId(null);
    if (!result) {
      notify({ message: SAVE_FAILED, tone: "error" });
      return;
    }
    // Undo puts the same record back in the same place.
    notify({
      message: `Deleted ${result.removed.role} at ${result.removed.company}.`,
      tone: "success",
      actionLabel: "Undo",
      onAction: () => {
        if (!restoreApplication(result.removed, result.index)) notify({ message: SAVE_FAILED, tone: "error" });
      },
    });
  }

  function markFollowUpDone(application: JobApplication) {
    if (updateApplication(application.id, { ...application, followUpOn: "" })) {
      notify({ message: "Follow-up marked as done.", tone: "success" });
    } else {
      notify({ message: SAVE_FAILED, tone: "error" });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {applications.length === 0
            ? "Start by adding a job you applied to or want to apply to."
            : `${applications.length} application${applications.length === 1 ? "" : "s"} tracked.`}
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          + Add application
        </button>
      </div>

      <Dashboard
        stats={stats}
        due={due}
        interviews={interviews}
        recent={recent}
        today={today}
        onFilter={(status) => {
          setStatusFilter(status);
          document.getElementById("list-heading")?.scrollIntoView({ behavior: "smooth" });
        }}
        onOpen={openEdit}
        onFollowUpDone={markFollowUpDone}
      />

      <section aria-labelledby="list-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="list-heading" className="text-lg font-semibold">
            Applications
          </h2>
          <BackupControls
            applications={applications}
            onNotify={(message, tone) => notify({ message, tone })}
            onImport={(imported) => {
              closeForm();
              if (replaceAll(imported)) {
                notify({ message: `Imported ${imported.length} application(s).`, tone: "success" });
              } else {
                notify({ message: SAVE_FAILED, tone: "error" });
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, role, location, notes, contact…"
            aria-label="Search applications"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <label className="flex shrink-0 items-center gap-2 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Sort</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <StatusFilter value={statusFilter} counts={stats.counts} onChange={setStatusFilter} />

        <ApplicationList
          applications={visible}
          onEdit={openEdit}
          onDelete={setDeletingId}
          emptyMessage={
            applications.length === 0
              ? "No applications yet. Click “Add application” to start."
              : "No applications match this filter or search."
          }
        />
      </section>

      <Modal
        open={formOpen}
        title={editing ? `Edit: ${editing.role} at ${editing.company}` : "Add an application"}
        onClose={closeForm}
        wide
      >
        {/* A new key gives a fresh form for each add/edit (no leftover values). */}
        {formOpen ? <ApplicationForm key={editing?.id ?? "new"} initial={editing} onSave={save} onCancel={closeForm} /> : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== undefined}
        title="Delete this application?"
        message={deleting ? `“${deleting.role}” at ${deleting.company} will be removed. You can undo this for a few seconds.` : ""}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
