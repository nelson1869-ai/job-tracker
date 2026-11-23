import { STATUSES, type JobApplication, type Status } from "./types";

// "All" plus every status, used by the filter buttons.
export type StatusFilter = "All" | Status;

// How many applications have each status (and how many in total).
export function countByStatus(applications: JobApplication[]): Record<StatusFilter, number> {
  const counts = { All: applications.length } as Record<StatusFilter, number>;
  for (const status of STATUSES) counts[status] = 0;
  for (const application of applications) counts[application.status] += 1;
  return counts;
}

// Keep only the applications that match the chosen status and the search text.
// The search looks at company, role, location, notes, contact, and next action,
// ignoring upper/lower case.
export function filterApplications(
  applications: JobApplication[],
  status: StatusFilter,
  query: string,
): JobApplication[] {
  const search = query.trim().toLowerCase();

  return applications.filter((application) => {
    if (status !== "All" && application.status !== status) return false;
    if (!search) return true;
    const text = [
      application.company,
      application.role,
      application.location,
      application.notes,
      application.contact,
      application.nextAction,
    ].join(" ");
    return text.toLowerCase().includes(search);
  });
}

// Today's date as "YYYY-MM-DD" in the user's own time zone,
// the same format that <input type="date"> uses.
export function todayString(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Applications whose follow-up date is today or already past, and that are
// still open (an Offer or a Rejection needs no follow-up). Oldest first.
// "YYYY-MM-DD" strings sort correctly as text, so no date parsing is needed.
export function dueFollowUps(applications: JobApplication[], today: string): JobApplication[] {
  return applications
    .filter(
      (application) =>
        application.followUpOn !== "" &&
        application.followUpOn <= today &&
        application.status !== "Offer" &&
        application.status !== "Rejected",
    )
    .sort((a, b) => a.followUpOn.localeCompare(b.followUpOn));
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "company", label: "Company (A–Z)" },
  { value: "appliedOn", label: "Date applied (newest)" },
  { value: "followUpOn", label: "Follow-up date (soonest)" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

// Returns a NEW sorted array (never changes the original list).
// Empty dates always go to the end, whatever the order.
export function sortApplications(applications: JobApplication[], key: SortKey): JobApplication[] {
  const list = [...applications];
  switch (key) {
    case "company":
      return list.sort((a, b) => a.company.localeCompare(b.company, undefined, { sensitivity: "base" }));
    case "appliedOn":
      return list.sort((a, b) => emptyLast(a.appliedOn, b.appliedOn) || b.appliedOn.localeCompare(a.appliedOn));
    case "followUpOn":
      return list.sort((a, b) => emptyLast(a.followUpOn, b.followUpOn) || a.followUpOn.localeCompare(b.followUpOn));
    default: // "newest"
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

// Puts "" after real values; returns 0 when both are set (or both empty).
function emptyLast(a: string, b: string): number {
  if (a === b || (a && b)) return 0;
  return a ? -1 : 1;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

// Interviews from now until `days` days ahead, soonest first.
// interviewAt is "YYYY-MM-DDTHH:mm", so comparing its date part as text works.
export function upcomingInterviews(applications: JobApplication[], today: string, days = 7): JobApplication[] {
  const end = addDays(today, days);
  return applications
    .filter((a) => a.interviewAt !== "" && a.interviewAt.slice(0, 10) >= today && a.interviewAt.slice(0, 10) <= end)
    .filter((a) => a.status !== "Offer" && a.status !== "Rejected")
    .sort((a, b) => a.interviewAt.localeCompare(b.interviewAt));
}

// "2026-11-22" + 7 days -> "2026-11-29" (handles month and year changes).
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return todayString(new Date(year, month - 1, day + days));
}

export interface DashboardStats {
  counts: Record<StatusFilter, number>;
  followUpsDue: number;
  interviewsThisWeek: number;
  responseRate: number; // % of sent applications that got an interview or offer
}

// Every number on the dashboard comes from the real list (nothing hard-coded).
export function dashboardStats(applications: JobApplication[], today: string): DashboardStats {
  const counts = countByStatus(applications);
  // "Sent" = everything except Saved (not applied yet).
  const sent = counts.All - counts.Saved;
  const responses = counts.Interview + counts.Offer;
  return {
    counts,
    followUpsDue: dueFollowUps(applications, today).length,
    interviewsThisWeek: upcomingInterviews(applications, today).length,
    responseRate: sent === 0 ? 0 : Math.round((responses / sent) * 100),
  };
}

// ---------------------------------------------------------------------------
// Changing status (used by the board's "Move to" control)
// ---------------------------------------------------------------------------

// Returns the application with a new status. Moving to "Applied" fills in
// today's date if no application date was set yet. Nothing else changes.
export function withStatus(application: JobApplication, status: Status, today: string): JobApplication {
  const appliedOn = status === "Applied" && !application.appliedOn ? today : application.appliedOn;
  return { ...application, status, appliedOn };
}
