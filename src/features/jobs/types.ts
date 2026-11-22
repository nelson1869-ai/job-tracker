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

// "" means "not set" for the two optional choice fields below.
export const EMPLOYMENT_TYPES = ["", "Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORKPLACE_TYPES = ["", "On-site", "Hybrid", "Remote"] as const;
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];

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
  // Added in version 2 (older saved data gets "" for each of these):
  salaryRange: string; // free text, e.g. "₱20,000 – ₱25,000 / month"
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  contact: string; // recruiter name, email, or phone
  interviewAt: string; // "YYYY-MM-DDTHH:mm" (local time), or ""
  resumeVersion: string; // e.g. "Resume v2 (Nov 2026)"
  nextAction: string; // e.g. "Send thank-you email"
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

// What the form fills in. The id and timestamps are added when saving.
export type JobApplicationInput = Omit<JobApplication, "id" | "createdAt" | "updatedAt">;
