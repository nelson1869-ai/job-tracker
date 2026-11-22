import type { Source } from "./types";

// Which website each job board lives on. A link matches if its hostname is the
// domain itself or ends with "." + domain (so "ph.indeed.com" matches "indeed.com").
const SOURCE_DOMAINS: { domain: string; source: Source }[] = [
  { domain: "linkedin.com", source: "LinkedIn" },
  { domain: "indeed.com", source: "Indeed" },
  { domain: "jobstreet.com", source: "JobStreet" },
  { domain: "kalibrr.com", source: "Kalibrr" },
  { domain: "onlinejobs.ph", source: "OnlineJobs.ph" },
];

// Returns the job board for a job-post link, or null if the link is not from a
// known board (or is not a full link yet while the user is still typing).
export function detectSource(link: string): Source | null {
  let hostname: string;
  try {
    // URL() throws for unfinished text like "linked", so we just return null then.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
    hostname = new URL(link.trim()).hostname.toLowerCase();
  } catch {
    return null;
  }

  const match = SOURCE_DOMAINS.find(
    ({ domain }) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
  return match ? match.source : null;
}
