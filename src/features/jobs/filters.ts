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
// The search looks at company, role, location, and notes, ignoring upper/lower case.
export function filterApplications(
  applications: JobApplication[],
  status: StatusFilter,
  query: string,
): JobApplication[] {
  const search = query.trim().toLowerCase();

  return applications.filter((application) => {
    if (status !== "All" && application.status !== status) return false;
    if (!search) return true;
    const text = `${application.company} ${application.role} ${application.location} ${application.notes}`;
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
