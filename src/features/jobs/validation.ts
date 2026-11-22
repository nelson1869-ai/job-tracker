import {
  EMPLOYMENT_TYPES,
  SOURCES,
  STATUSES,
  WORKPLACE_TYPES,
  type EmploymentType,
  type JobApplication,
  type JobApplicationInput,
  type Source,
  type Status,
  type WorkplaceType,
} from "./types";

// ---------------------------------------------------------------------------
// 1. Cleaning data we did not create ourselves (localStorage, backup files).
//    Used by storage.ts AND backup.ts, so both follow the same rules.
// ---------------------------------------------------------------------------

const DATE = /^\d{4}-\d{2}-\d{2}$/; // "2026-11-22"
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // "2026-11-22T14:30"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function matches(value: unknown, pattern: RegExp): string {
  const s = text(value);
  return pattern.test(s) ? s : "";
}

// If the value is one of the allowed options, use it; otherwise use the fallback.
function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

// Turn one unknown item into a valid JobApplication, or null if it is unusable
// (no company or no role). Missing newer fields get safe empty values, so data
// saved by older versions of the app still loads.
export function normalizeApplication(item: unknown, now: Date = new Date()): JobApplication | null {
  if (!isObject(item)) return null;
  const company = text(item.company);
  const role = text(item.role);
  if (!company || !role) return null;

  const timestamp = now.toISOString();
  return {
    id: text(item.id) || crypto.randomUUID(),
    company,
    role,
    url: text(item.url),
    source: oneOf<Source>(item.source, SOURCES, "Other"),
    location: text(item.location),
    status: oneOf<Status>(item.status, STATUSES, "Applied"),
    appliedOn: matches(item.appliedOn, DATE),
    followUpOn: matches(item.followUpOn, DATE),
    notes: text(item.notes),
    salaryRange: text(item.salaryRange),
    employmentType: oneOf<EmploymentType>(item.employmentType, EMPLOYMENT_TYPES, ""),
    workplaceType: oneOf<WorkplaceType>(item.workplaceType, WORKPLACE_TYPES, ""),
    contact: text(item.contact),
    interviewAt: matches(item.interviewAt, DATE_TIME),
    resumeVersion: text(item.resumeVersion),
    nextAction: text(item.nextAction),
    createdAt: text(item.createdAt) || timestamp,
    updatedAt: text(item.updatedAt) || timestamp,
  };
}

// Clean a whole list. Unusable items are skipped (not fatal), and duplicate ids
// are fixed so React keys and edits never mix two applications up.
export function normalizeList(data: unknown): JobApplication[] {
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const result: JobApplication[] = [];
  for (const item of data) {
    const application = normalizeApplication(item);
    if (!application) continue;
    if (seen.has(application.id)) application.id = crypto.randomUUID();
    seen.add(application.id);
    result.push(application);
  }
  return result;
}

// ---------------------------------------------------------------------------
// 2. Checking what the user typed in the form, with friendly messages.
// ---------------------------------------------------------------------------

export type FormErrors = Partial<Record<keyof JobApplicationInput, string>>;

export function validateInput(input: JobApplicationInput): FormErrors {
  const errors: FormErrors = {};

  if (!input.company) errors.company = "Enter the company name.";
  if (!input.role) errors.role = "Enter the job title.";

  if (input.url && !/^https?:\/\/\S+$/i.test(input.url)) {
    errors.url = "Paste the full link, starting with https://";
  }
  if (input.appliedOn && !DATE.test(input.appliedOn)) errors.appliedOn = "Choose a valid date.";
  if (input.followUpOn && !DATE.test(input.followUpOn)) errors.followUpOn = "Choose a valid date.";
  if (input.interviewAt && !DATE_TIME.test(input.interviewAt)) {
    errors.interviewAt = "Choose a date and time.";
  }

  // A follow-up before the application date is almost always a typo.
  // ("YYYY-MM-DD" strings compare correctly as text.)
  if (input.appliedOn && input.followUpOn && input.followUpOn < input.appliedOn) {
    errors.followUpOn = "The follow-up date is before the date you applied.";
  }
  return errors;
}

// A blank form, also used to fill missing fields in tests.
export const EMPTY_INPUT: JobApplicationInput = {
  company: "",
  role: "",
  url: "",
  source: "LinkedIn",
  location: "",
  status: "Applied",
  appliedOn: "",
  followUpOn: "",
  notes: "",
  salaryRange: "",
  employmentType: "",
  workplaceType: "",
  contact: "",
  interviewAt: "",
  resumeVersion: "",
  nextAction: "",
};
