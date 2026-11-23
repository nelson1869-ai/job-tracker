// Turning stored values into friendly text for the screen.

// "2026-11-25T14:30" -> "Wed, Nov 25, 2:30 PM" (in the user's own time zone).
// A "YYYY-MM-DDTHH:mm" string without a zone is read as LOCAL time by new Date().
export function formatInterview(interviewAt: string): string {
  if (!interviewAt) return "";
  const date = new Date(interviewAt);
  if (Number.isNaN(date.getTime())) return interviewAt;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// "2026-11-25" -> "Nov 25, 2026". Built from the parts, so no time-zone shift.
export function formatDate(day: string): string {
  if (!day) return "";
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(year, month - 1, date),
  );
}
