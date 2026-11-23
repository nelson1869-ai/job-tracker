"use client";

import type { DashboardStats, StatusFilter } from "./filters";
import { formatDate, formatInterview } from "./format";
import { STATUSES, type JobApplication, type Status } from "./types";

// One color per status, used by the metric dots, the pipeline bar, and badges.
export const STATUS_COLOR: Record<Status, { dot: string; badge: string }> = {
  Saved: { dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" },
  Applied: { dot: "bg-sky-500", badge: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200" },
  Interview: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  Offer: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" },
  Rejected: { dot: "bg-rose-500", badge: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200" },
};

const card = "rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900";

interface DashboardProps {
  stats: DashboardStats;
  due: JobApplication[];
  interviews: JobApplication[];
  recent: JobApplication[];
  today: string;
  onFilter: (status: StatusFilter) => void;
  onOpen: (id: string) => void;
  onFollowUpDone: (application: JobApplication) => void;
}

export function Dashboard({ stats, due, interviews, recent, today, onFilter, onOpen, onFollowUpDone }: DashboardProps) {
  const { counts } = stats;

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-4">
      <h2 id="dashboard-heading" className="sr-only">
        Dashboard
      </h2>

      {/* Metrics: every number is calculated from the saved applications. */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Metric label="Total" value={counts.All} onClick={() => onFilter("All")} />
        {STATUSES.map((status) => (
          <Metric key={status} label={status} value={counts[status]} dot={STATUS_COLOR[status].dot} onClick={() => onFilter(status)} />
        ))}
        <Metric label="Follow-ups due" value={stats.followUpsDue} highlight={stats.followUpsDue > 0} />
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pipeline: one bar split by status, with a readable list underneath. */}
        <div className={`${card} lg:col-span-2`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold">Pipeline</h3>
            <p className="text-sm text-zinc-500">
              Response rate <strong className="text-zinc-900 dark:text-zinc-100">{stats.responseRate}%</strong>
              <span className="sr-only"> (interviews and offers out of applications sent)</span>
            </p>
          </div>
          {counts.All === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Your pipeline appears here after you add an application.</p>
          ) : (
            <>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden="true">
                {STATUSES.map((status) =>
                  counts[status] > 0 ? (
                    <div key={status} className={STATUS_COLOR[status].dot} style={{ width: `${(counts[status] / counts.All) * 100}%` }} />
                  ) : null,
                )}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {STATUSES.map((status) => (
                  <li key={status} className="inline-flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[status].dot}`} aria-hidden="true" />
                    {status} {counts[status]}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3 className="mt-6 font-semibold">Recent applications</h3>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Nothing yet. Use “Add application” to start.</p>
          ) : (
            <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              {recent.map((application) => (
                <li key={application.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(application.id)}
                    className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{application.role}</span>
                      <span className="block truncate text-zinc-500">{application.company}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[application.status].badge}`}>
                      {application.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Needs attention: follow-ups due and interviews this week. */}
        <div className={card}>
          <h3 className="font-semibold">Needs attention</h3>
          {due.length === 0 && interviews.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Nothing due. Follow-ups and interviews this week show up here.</p>
          ) : null}

          {due.length > 0 ? (
            <>
              <h4 className="mt-3 text-xs font-semibold text-zinc-500 uppercase">Follow-ups due</h4>
              <ul className="mt-1 space-y-2">
                {due.map((application) => (
                  <li key={application.id} className="text-sm">
                    <button type="button" onClick={() => onOpen(application.id)} className="text-left font-medium hover:underline">
                      {application.role} · {application.company}
                    </button>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={application.followUpOn < today ? "text-rose-700 dark:text-rose-400" : "text-amber-700 dark:text-amber-400"}>
                        {application.followUpOn < today ? `Overdue since ${formatDate(application.followUpOn)}` : "Due today"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onFollowUpDone(application)}
                        className="rounded-md px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                      >
                        Done
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {interviews.length > 0 ? (
            <>
              <h4 className="mt-4 text-xs font-semibold text-zinc-500 uppercase">Interviews this week</h4>
              <ul className="mt-1 space-y-2">
                {interviews.map((application) => (
                  <li key={application.id} className="text-sm">
                    <button type="button" onClick={() => onOpen(application.id)} className="text-left font-medium hover:underline">
                      {application.role} · {application.company}
                    </button>
                    <div className="text-zinc-600 dark:text-zinc-400">{formatInterview(application.interviewAt)}</div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  dot,
  highlight,
  onClick,
}: {
  label: string;
  value: number;
  dot?: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
        {dot ? <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" /> : null}
        {label}
      </span>
      <span className={`mt-1 block text-2xl font-semibold ${highlight ? "text-amber-700 dark:text-amber-400" : ""}`}>{value}</span>
    </>
  );
  const box = "block w-full rounded-xl border border-zinc-200 bg-white p-3 text-left dark:border-zinc-800 dark:bg-zinc-900";
  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} className={`${box} hover:border-zinc-300 dark:hover:border-zinc-700`} aria-label={`${label}: ${value}. Show these applications`}>
          {content}
        </button>
      ) : (
        <div className={box}>{content}</div>
      )}
    </li>
  );
}
