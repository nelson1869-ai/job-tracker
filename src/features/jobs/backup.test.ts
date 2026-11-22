import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "./backup";
import type { JobApplication } from "./types";

const sample: JobApplication = {
  id: "abc",
  company: "Acme",
  role: "Junior Web Developer",
  url: "https://ph.jobstreet.com/job/1",
  source: "JobStreet",
  location: "Bacolod",
  status: "Interview",
  appliedOn: "2026-11-10",
  followUpOn: "2026-11-17",
  notes: "Ask about the stack",
  createdAt: "2026-11-10T00:00:00.000Z",
  updatedAt: "2026-11-12T00:00:00.000Z",
};

describe("createBackup + parseBackup", () => {
  it("round-trips: what we export, we can import unchanged", () => {
    const text = createBackup([sample], new Date("2026-11-22T00:00:00Z"));
    const result = parseBackup(text);
    expect(result).toEqual({ ok: true, applications: [sample] });
  });

  it("writes the app name and version so we can recognise our files", () => {
    const data = JSON.parse(createBackup([]));
    expect(data.app).toBe("job-tracker");
    expect(data.version).toBe(1);
  });
});

describe("parseBackup", () => {
  it("accepts a plain array too", () => {
    const result = parseBackup(JSON.stringify([sample]));
    expect(result.ok).toBe(true);
  });

  it("rejects text that is not JSON", () => {
    expect(parseBackup("hello")).toEqual({ ok: false, error: "This file is not valid JSON." });
  });

  it("rejects JSON that is not a backup", () => {
    expect(parseBackup('{"name":"something else"}').ok).toBe(false);
  });

  it("rejects an item without a company or role and says which one", () => {
    const result = parseBackup(JSON.stringify([sample, { company: "No role" }]));
    expect(result).toEqual({ ok: false, error: "Item 2 is missing a company or role." });
  });

  it("cleans up bad fields instead of trusting them", () => {
    const result = parseBackup(
      JSON.stringify([
        {
          company: "  Beta  ",
          role: "Dev",
          status: "Hired!!", // not a real status
          source: "Facebook", // not in our list
          appliedOn: "yesterday", // not YYYY-MM-DD
          notes: 42, // not text
        },
      ]),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const [item] = result.applications;
    expect(item.company).toBe("Beta"); // trimmed
    expect(item.status).toBe("Applied"); // safe default
    expect(item.source).toBe("Other"); // safe default
    expect(item.appliedOn).toBe(""); // dropped
    expect(item.notes).toBe(""); // dropped
    expect(item.id).not.toBe(""); // a new id was made
  });
});
