"use client";

import { formatDate, formatInterview } from "./format";
import { StatusBadge } from "./status-colors";
import type { JobApplication } from "./types";

interface ApplicationDetailsProps {
  application: JobApplication;
  onEdit: () => void;
  onDelete: () => void;
}

// Everything about one application, shown inside the details modal.
// Empty fields are skipped so the view stays short.
export function ApplicationDetails({ application, onEdit, onDelete }: ApplicationDetailsProps) {
  const rows: [label: string, value: string][] = [
    ["Company", application.company],
    ["Found on", application.source],
    ["Location", application.location],
    ["Workplace", application.workplaceType],
    ["Employment type", application.employmentType],
    ["Salary range", application.salaryRange],
    ["Date applied", formatDate(application.appliedOn)],
    ["Follow up on", formatDate(application.followUpOn)],
    ["Interview", formatInterview(application.interviewAt)],
    ["Recruiter / contact", application.contact],
    ["Resume version sent", application.resumeVersion],
    ["Next action", application.nextAction],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={application.status} />
        {application.url ? (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Open job post ↗
          </a>
        ) : null}
      </div>

      {/* A description list: each <dt> is a label, its <dd> the value. */}
      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows
          .filter(([, value]) => value !== "")
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-zinc-500 uppercase">{label}</dt>
              <dd className="mt-0.5 text-sm break-words">{value}</dd>
            </div>
          ))}
      </dl>

      {application.notes ? (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase">Notes</h3>
          <p className="mt-1 text-sm whitespace-pre-line">{application.notes}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onDelete}
          className="h-10 rounded-lg px-4 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
        >
          Delete
        </button>
        <button type="button" onClick={onEdit} className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
          Edit
        </button>
      </div>
    </div>
  );
}
