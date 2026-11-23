"use client";

import { formatDate } from "./format";
import { StatusBadge } from "./status-colors";
import type { JobApplication } from "./types";

interface ApplicationListProps {
  applications: JobApplication[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
}

// The "List" view. One list, two layouts chosen by CSS:
// a table on medium screens and up, cards on phones (a wide table would overflow).
export function ApplicationList({ applications, onView, onEdit, onDelete, emptyMessage }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {emptyMessage}
      </p>
    );
  }

  const actions = (application: JobApplication) => (
    <div className="flex flex-wrap gap-1">
      <button type="button" onClick={() => onEdit(application.id)} className="rounded-md px-2 py-1 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(application.id)} // the parent asks for confirmation
        className="rounded-md px-2 py-1 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
      >
        Delete
      </button>
    </div>
  );

  return (
    <>
      {/* Table: md and up */}
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Job applications</caption>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-950">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Job</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Applied</th>
              <th scope="col" className="px-4 py-3 font-medium">Follow up</th>
              <th scope="col" className="px-4 py-3 font-medium">Found on</th>
              <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  {/* The job title opens the details view. */}
                  <button type="button" onClick={() => onView(application.id)} className="text-left font-medium hover:underline">
                    {application.role}
                  </button>
                  <div className="text-zinc-500">
                    {application.company}
                    {application.workplaceType ? ` · ${application.workplaceType}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={application.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{formatDate(application.appliedOn) || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{formatDate(application.followUpOn) || "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{application.source}</td>
                <td className="px-4 py-3">{actions(application)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards: phones */}
      <ul className="space-y-3 md:hidden">
        {applications.map((application) => (
          <li key={application.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onView(application.id)} className="min-w-0 text-left">
                <span className="block font-semibold hover:underline">{application.role}</span>
                <span className="block text-sm text-zinc-500">
                  {application.company} · {application.source}
                </span>
              </button>
              <StatusBadge status={application.status} />
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {application.appliedOn ? `Applied ${formatDate(application.appliedOn)}` : "Not applied yet"}
              {application.followUpOn ? (
                <span className="whitespace-nowrap"> · Follow up {formatDate(application.followUpOn)}</span>
              ) : null}
            </p>
            {application.nextAction ? <p className="mt-1 text-sm">Next: {application.nextAction}</p> : null}
            <div className="mt-2">{actions(application)}</div>
          </li>
        ))}
      </ul>
    </>
  );
}
