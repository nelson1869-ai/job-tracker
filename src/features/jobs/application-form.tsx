"use client";

import { SOURCES, STATUSES, type JobApplication, type JobApplicationInput, type Source, type Status } from "./types";

interface ApplicationFormProps {
  // When editing, the form starts with this application's values.
  initial?: JobApplication;
  onSave: (input: JobApplicationInput) => void;
  onCancel?: () => void;
}

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function ApplicationForm({ initial, onSave, onCancel }: ApplicationFormProps) {
  // Read all fields at once with FormData when the form is submitted.
  // Docs: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();

    onSave({
      company: text("company"),
      role: text("role"),
      url: text("url"),
      source: text("source") as Source,
      location: text("location"),
      status: text("status") as Status,
      appliedOn: text("appliedOn"),
      followUpOn: text("followUpOn"),
      notes: text("notes"),
    });

    if (!initial) event.currentTarget.reset(); // clear the form after adding
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Company *
        <input name="company" required defaultValue={initial?.company} className={inputClass} />
      </label>
      <label className={labelClass}>
        Role *
        <input name="role" required defaultValue={initial?.role} className={inputClass} />
      </label>

      <label className={labelClass}>
        Status
        <select name="status" defaultValue={initial?.status ?? "Applied"} className={inputClass}>
          {STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Found on
        <select name="source" defaultValue={initial?.source ?? "LinkedIn"} className={inputClass}>
          {SOURCES.map((source) => (
            <option key={source}>{source}</option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Date applied
        <input type="date" name="appliedOn" defaultValue={initial?.appliedOn} className={inputClass} />
      </label>
      <label className={labelClass}>
        Follow up on
        <input type="date" name="followUpOn" defaultValue={initial?.followUpOn} className={inputClass} />
      </label>

      <label className={labelClass}>
        Location
        <input
          name="location"
          placeholder="Bacolod, Remote…"
          defaultValue={initial?.location}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Job post link
        <input type="url" name="url" placeholder="https://…" defaultValue={initial?.url} className={inputClass} />
      </label>

      <label className={`${labelClass} sm:col-span-2`}>
        Notes
        <textarea name="notes" rows={3} defaultValue={initial?.notes} className={inputClass} />
      </label>

      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          {initial ? "Save changes" : "Add application"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
