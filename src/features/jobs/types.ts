// The shape of one job application, plus the fixed lists used by the form.

export const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"] as const;
export type Status = (typeof STATUSES)[number];

export const SOURCES = [
  "LinkedIn",
  "Indeed",
  "JobStreet",
  "Kalibrr",
  "OnlineJobs.ph",
  "Company website",
  "Other",
] as const;
export type Source = (typeof SOURCES)[number];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  url: string; // link to the job post (can be empty)
  source: Source;
  location: string;
  status: Status;
  appliedOn: string; // "YYYY-MM-DD", or "" if not applied yet
  followUpOn: string; // "YYYY-MM-DD", or "" if no follow-up planned
  notes: string;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

// What the form fills in. The id and timestamps are added when saving.
export type JobApplicationInput = Omit<JobApplication, "id" | "createdAt" | "updatedAt">;
