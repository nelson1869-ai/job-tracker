"use client";

import { useState, type ReactNode } from "react";
import { detectSource } from "./detect-source";
import {
  EMPLOYMENT_TYPES,
  SOURCES,
  STATUSES,
  WORKPLACE_TYPES,
  type EmploymentType,
  type JobApplication,
  type JobApplicationInput,
  type Source,
  type Status,
  type WorkplaceType,
} from "./types";
import { EMPTY_INPUT, validateInput, type FormErrors } from "./validation";

interface ApplicationFormProps {
  initial?: JobApplication; // when editing, the form starts with these values
  onSave: (input: JobApplicationInput) => void;
  onCancel: () => void;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 aria-[invalid=true]:border-rose-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

// A labelled field with its error message linked by aria-describedby,
// so screen readers read the error together with the label.
// It is defined OUTSIDE ApplicationForm on purpose: a component defined inside
// another one is a new type on every render, so React would recreate the inputs
// and wipe what the user typed.
function Field({
  name,
  label,
  error,
  wide,
  children,
}: {
  name: keyof JobApplicationInput;
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={`f-${name}`} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`f-${name}-error`} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ApplicationForm({ initial, onSave, onCancel }: ApplicationFormProps) {
  // "Found on" is kept in state so pasting a link can change it (auto fill).
  const [source, setSource] = useState<Source>(initial?.source ?? "LinkedIn");
  const [autoFilled, setAutoFilled] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Read every field at once with FormData when the form is submitted.
  // Docs: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const text = (name: keyof JobApplicationInput) => String(form.get(name) ?? "").trim();

    const input: JobApplicationInput = {
      ...EMPTY_INPUT,
      company: text("company"),
      role: text("role"),
      url: text("url"),
      source: text("source") as Source,
      location: text("location"),
      status: text("status") as Status,
      appliedOn: text("appliedOn"),
      followUpOn: text("followUpOn"),
      notes: text("notes"),
      salaryRange: text("salaryRange"),
      employmentType: text("employmentType") as EmploymentType,
      workplaceType: text("workplaceType") as WorkplaceType,
      contact: text("contact"),
      interviewAt: text("interviewAt"),
      resumeVersion: text("resumeVersion"),
      nextAction: text("nextAction"),
    };

    const found = validateInput(input);
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      // Move focus to the first field with a problem, so it is easy to fix.
      formElement.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }
    onSave(input);
  }

  // Props shared by every input: id, name, and the error wiring.
  const control = (name: keyof JobApplicationInput) => ({
    id: `f-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `f-${name}-error` : undefined,
    className: inputClass,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-zinc-500 uppercase">The job</legend>
        <Field name="url" error={errors.url} label="Job post link" wide>
          <input
            {...control("url")}
            type="url"
            inputMode="url"
            placeholder="Paste the link — 'Found on' fills itself"
            defaultValue={initial?.url}
            onChange={(event) => {
              const detected = detectSource(event.target.value);
              if (detected) {
                setSource(detected);
                setAutoFilled(true);
              }
            }}
          />
        </Field>
        <Field name="company" error={errors.company} label="Company *">
          <input {...control("company")} placeholder="e.g. Acme Web Studio" defaultValue={initial?.company} />
        </Field>
        <Field name="role" error={errors.role} label="Job title *">
          <input {...control("role")} placeholder="e.g. Junior Web Developer" defaultValue={initial?.role} />
        </Field>
        <Field name="status" error={errors.status} label="Status">
          <select {...control("status")} defaultValue={initial?.status ?? "Applied"}>
            {STATUSES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field name="source" error={errors.source} label="Found on">
          <select
            {...control("source")}
            value={source}
            onChange={(event) => {
              setSource(event.target.value as Source);
              setAutoFilled(false); // the user chose it themselves
            }}
          >
            {SOURCES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {autoFilled ? (
            <span className="mt-1 block text-xs text-emerald-700 dark:text-emerald-400">Filled in from the link</span>
          ) : null}
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold text-zinc-500 uppercase">Dates</legend>
        <Field name="appliedOn" error={errors.appliedOn} label="Date applied">
          <input {...control("appliedOn")} type="date" defaultValue={initial?.appliedOn} />
        </Field>
        <Field name="followUpOn" error={errors.followUpOn} label="Follow up on">
          <input {...control("followUpOn")} type="date" defaultValue={initial?.followUpOn} />
        </Field>
        <Field name="interviewAt" error={errors.interviewAt} label="Interview">
          <input {...control("interviewAt")} type="datetime-local" defaultValue={initial?.interviewAt} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-zinc-500 uppercase">Details</legend>
        <Field name="location" error={errors.location} label="Location">
          <input {...control("location")} placeholder="e.g. Bacolod City" defaultValue={initial?.location} />
        </Field>
        <Field name="workplaceType" error={errors.workplaceType} label="Workplace">
          <select {...control("workplaceType")} defaultValue={initial?.workplaceType ?? ""}>
            {WORKPLACE_TYPES.map((option) => (
              <option key={option} value={option}>
                {option || "Not set"}
              </option>
            ))}
          </select>
        </Field>
        <Field name="employmentType" error={errors.employmentType} label="Employment type">
          <select {...control("employmentType")} defaultValue={initial?.employmentType ?? ""}>
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option} value={option}>
                {option || "Not set"}
              </option>
            ))}
          </select>
        </Field>
        <Field name="salaryRange" error={errors.salaryRange} label="Salary range">
          <input {...control("salaryRange")} placeholder="e.g. ₱20,000 – ₱25,000 / month" defaultValue={initial?.salaryRange} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-zinc-500 uppercase">People and next steps</legend>
        <Field name="contact" error={errors.contact} label="Recruiter / contact">
          <input {...control("contact")} placeholder="Name, email, or phone" defaultValue={initial?.contact} />
        </Field>
        <Field name="resumeVersion" error={errors.resumeVersion} label="Resume version sent">
          <input {...control("resumeVersion")} placeholder="e.g. Resume v2 (Nov 2026)" defaultValue={initial?.resumeVersion} />
        </Field>
        <Field name="nextAction" error={errors.nextAction} label="Next action" wide>
          <input {...control("nextAction")} placeholder="e.g. Send a thank-you email" defaultValue={initial?.nextAction} />
        </Field>
        <Field name="notes" error={errors.notes} label="Notes" wide>
          <textarea {...control("notes")} rows={3} defaultValue={initial?.notes} />
        </Field>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button type="submit" className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
          {initial ? "Save changes" : "Add application"}
        </button>
      </div>
    </form>
  );
}
