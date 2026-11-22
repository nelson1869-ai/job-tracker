"use client";

import type { JobApplication } from "./types";

interface FollowUpBannerProps {
  due: JobApplication[];
  onDone: (application: JobApplication) => void;
  onEdit: (id: string) => void;
}

// Shown only when at least one follow-up is due today or overdue.
export function FollowUpBanner({ due, onDone, onEdit }: FollowUpBannerProps) {
  if (due.length === 0) return null;

  return (
    <section
      aria-labelledby="follow-up-heading"
      className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40"
    >
      <h2 id="follow-up-heading" className="font-semibold text-amber-900 dark:text-amber-200">
        {due.length === 1 ? "1 follow-up is due" : `${due.length} follow-ups are due`}
      </h2>
      <ul className="mt-2 space-y-2">
        {due.map((application) => (
          <li key={application.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              <strong>{application.role}</strong> at {application.company}
              <span className="text-zinc-600 dark:text-zinc-400">
                {" · "}
                <span className="whitespace-nowrap">due {application.followUpOn}</span>
              </span>
            </span>
            <span className="flex gap-3 font-medium">
              <button type="button" onClick={() => onEdit(application.id)} className="hover:underline">
                Edit
              </button>
              {/* "Done" clears the follow-up date, so it leaves this list. */}
              <button
                type="button"
                onClick={() => onDone(application)}
                className="text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Done
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
