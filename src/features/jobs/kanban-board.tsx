"use client";

import { STATUS_COLOR } from "./status-colors";
import { STATUSES, type JobApplication, type Status } from "./types";

interface KanbanBoardProps {
  applications: JobApplication[];
  onView: (id: string) => void;
  onMove: (application: JobApplication, status: Status) => void;
}

// The "Board" view: one column per stage. Moving a card uses a normal <select>
// instead of drag-and-drop, so it works the same with a mouse, a keyboard,
// a screen reader, or a touchscreen.
export function KanbanBoard({ applications, onView, onMove }: KanbanBoardProps) {
  return (
    // Only this box scrolls sideways on small screens, never the whole page.
    // "relative" matters: without it, the absolutely positioned screen-reader
    // labels (sr-only) inside escape this scroll box and widen the whole page.
    <div className="relative -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="grid min-w-[56rem] grid-cols-5 gap-3">
        {STATUSES.map((status) => {
          const column = applications.filter((application) => application.status === status);
          return (
            <section
              key={status}
              aria-labelledby={`col-${status}`}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h3 id={`col-${status}`} className="flex items-center gap-2 text-sm font-semibold">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[status].dot}`} aria-hidden="true" />
                {status}
                <span className="font-normal text-zinc-500">{column.length}</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {column.length === 0 ? <li className="text-xs text-zinc-500">Nothing here</li> : null}
                {column.map((application) => (
                  <li key={application.id} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <button type="button" onClick={() => onView(application.id)} className="block w-full text-left">
                      <span className="block text-sm font-medium hover:underline">{application.role}</span>
                      <span className="block text-xs text-zinc-500">{application.company}</span>
                    </button>
                    <label className="mt-2 block text-xs text-zinc-500">
                      <span className="sr-only">
                        Move {application.role} at {application.company} to
                      </span>
                      <select
                        value={application.status}
                        onChange={(event) => onMove(application, event.target.value as Status)}
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                      >
                        {STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option === application.status ? `In ${option}` : `Move to ${option}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
