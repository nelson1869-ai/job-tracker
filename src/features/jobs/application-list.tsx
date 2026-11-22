"use client";

import type { JobApplication, Status } from "./types";

// One color per status so the list is easy to scan.
const statusColor: Record<Status, string> = {
  Saved: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  Applied: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  Interview: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  Offer: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  Rejected: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

interface ApplicationListProps {
  applications: JobApplication[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ApplicationList({ applications, onEdit, onDelete }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No applications yet. Add the first job you applied to above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {applications.map((application) => (
        <li
          key={application.id}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{application.role}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {application.company}
                {application.location ? ` · ${application.location}` : ""} · {application.source}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[application.status]}`}>
              {application.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {application.appliedOn ? `Applied ${application.appliedOn}` : "Not applied yet"}
            {application.followUpOn ? ` · Follow up ${application.followUpOn}` : ""}
          </p>
          {application.notes ? <p className="mt-2 text-sm whitespace-pre-line">{application.notes}</p> : null}

          <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
            {application.url ? (
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Open job post ↗
              </a>
            ) : null}
            <button type="button" onClick={() => onEdit(application.id)} className="hover:underline">
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                // Simple browser confirm so nothing is deleted by accident.
                if (confirm(`Delete "${application.role}" at ${application.company}?`)) {
                  onDelete(application.id);
                }
              }}
              className="text-rose-700 hover:underline dark:text-rose-400"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
