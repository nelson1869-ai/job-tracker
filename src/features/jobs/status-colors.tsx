import type { Status } from "./types";

// One color set per status, shared by the dashboard, table, cards, and board,
// so the same status always looks the same everywhere.
export const STATUS_COLOR: Record<Status, { dot: string; badge: string }> = {
  Saved: { dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" },
  Applied: { dot: "bg-sky-500", badge: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200" },
  Interview: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  Offer: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" },
  Rejected: { dot: "bg-rose-500", badge: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200" },
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_COLOR[status].badge}`}>{status}</span>;
}
