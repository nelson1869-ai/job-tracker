import { describe, expect, it } from "vitest";
import { countByStatus, dueFollowUps, filterApplications, todayString } from "./filters";
import type { JobApplication, Status } from "./types";

// Small helper so each test only writes the fields it cares about.
function app(overrides: Partial<JobApplication> & { status?: Status } = {}): JobApplication {
  return {
    id: overrides.id ?? Math.random().toString(),
    company: "Acme",
    role: "Junior Web Developer",
    url: "",
    source: "LinkedIn",
    location: "Bacolod",
    status: "Applied",
    appliedOn: "2026-11-10",
    followUpOn: "",
    notes: "",
    createdAt: "2026-11-10T00:00:00Z",
    updatedAt: "2026-11-10T00:00:00Z",
    ...overrides,
  };
}

describe("countByStatus", () => {
  it("counts every status, including ones with zero", () => {
    const counts = countByStatus([app({ status: "Applied" }), app({ status: "Applied" }), app({ status: "Offer" })]);
    expect(counts).toEqual({ All: 3, Saved: 0, Applied: 2, Interview: 0, Offer: 1, Rejected: 0 });
  });
});

describe("filterApplications", () => {
  const list = [
    app({ id: "1", role: "React Developer", status: "Applied" }),
    app({ id: "2", company: "Beta", status: "Interview", notes: "Needs a portfolio link" }),
    app({ id: "3", location: "Remote", status: "Rejected" }),
  ];

  it("keeps everything for All with no search", () => {
    expect(filterApplications(list, "All", "")).toHaveLength(3);
  });

  it("filters by status", () => {
    expect(filterApplications(list, "Interview", "").map((a) => a.id)).toEqual(["2"]);
  });

  it("searches company, role, location and notes, ignoring case", () => {
    expect(filterApplications(list, "All", "REACT").map((a) => a.id)).toEqual(["1"]);
    expect(filterApplications(list, "All", "portfolio").map((a) => a.id)).toEqual(["2"]);
    expect(filterApplications(list, "All", "remote").map((a) => a.id)).toEqual(["3"]);
  });

  it("combines status and search", () => {
    expect(filterApplications(list, "Applied", "beta")).toHaveLength(0);
  });
});

describe("todayString", () => {
  it("formats a date as YYYY-MM-DD with zero padding", () => {
    expect(todayString(new Date(2026, 0, 5))).toBe("2026-01-05"); // month 0 = January
  });
});

describe("dueFollowUps", () => {
  const today = "2026-11-22";

  it("includes follow-ups due today or earlier, oldest first", () => {
    const due = dueFollowUps(
      [
        app({ id: "today", followUpOn: "2026-11-22" }),
        app({ id: "late", followUpOn: "2026-11-01" }),
        app({ id: "future", followUpOn: "2026-11-30" }),
        app({ id: "none", followUpOn: "" }),
      ],
      today,
    );
    expect(due.map((a) => a.id)).toEqual(["late", "today"]);
  });

  it("skips applications that already ended (Offer or Rejected)", () => {
    const due = dueFollowUps(
      [app({ status: "Offer", followUpOn: "2026-11-01" }), app({ status: "Rejected", followUpOn: "2026-11-01" })],
      today,
    );
    expect(due).toHaveLength(0);
  });
});
