"use client";

import { useState } from "react";
import { detectSource } from "./detect-source";
import { EMPTY_INPUT } from "./validation";
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
  // "Found on" is kept in state so pasting a link can change it (auto fill).
  const [source, setSource] = useState<Source>(initial?.source ?? "LinkedIn");
  const [autoFilled, setAutoFilled] = useState(false);

  // Read all fields at once with FormData when the form is submitted.
  // Docs: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();

    onSave({
      ...(initial ?? EMPTY_INPUT), // keep fields this form does not show yet
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

    if (!initial) {
      event.currentTarget.reset(); // clear the form after adding
      setAutoFilled(false); // "Found on" keeps the last choice, which is handy for the next one
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Job post link
        <input
          type="url"
          name="url"
          placeholder="Paste the link — we fill in where you found it"
          defaultValue={initial?.url}
          onChange={(event) => {
            const detected = detectSource(event.target.value);
            if (detected) {
              setSource(detected);
              setAutoFilled(true);
            }
          }}
          className={inputClass}
        />
      </label>

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
        <select
          name="source"
          value={source}
          onChange={(event) => {
            setSource(event.target.value as Source);
            setAutoFilled(false); // the user chose it themselves
          }}
          className={inputClass}
        >
          {SOURCES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        {autoFilled ? (
          <span className="mt-1 block text-xs font-normal text-emerald-700 dark:text-emerald-400">
            Filled in from the link
          </span>
        ) : null}
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
