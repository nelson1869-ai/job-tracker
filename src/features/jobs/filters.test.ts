import { describe, expect, it } from "vitest";
import {
  addDays,
  countByStatus,
  dashboardStats,
  dueFollowUps,
  filterApplications,
  sortApplications,
  todayString,
  upcomingInterviews,
  withStatus,
} from "./filters";
import type { JobApplication, Status } from "./types";
import { EMPTY_INPUT } from "./validation";

// Small helper so each test only writes the fields it cares about.
function app(overrides: Partial<JobApplication> & { status?: Status } = {}): JobApplication {
  return {
    ...EMPTY_INPUT,
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

describe("sortApplications", () => {
  const list = [
    app({ id: "b", company: "beta", appliedOn: "2026-11-05", followUpOn: "", createdAt: "2026-11-02T00:00:00Z" }),
    app({ id: "a", company: "Acme", appliedOn: "", followUpOn: "2026-11-20", createdAt: "2026-11-03T00:00:00Z" }),
    app({ id: "c", company: "Cee", appliedOn: "2026-11-09", followUpOn: "2026-11-15", createdAt: "2026-11-01T00:00:00Z" }),
  ];
  const ids = (key: Parameters<typeof sortApplications>[1]) => sortApplications(list, key).map((a) => a.id);

  it("sorts newest first by default", () => expect(ids("newest")).toEqual(["a", "b", "c"]));
  it("sorts by company, ignoring upper/lower case", () => expect(ids("company")).toEqual(["a", "b", "c"]));
  it("sorts by date applied, newest first, empty dates last", () => expect(ids("appliedOn")).toEqual(["c", "b", "a"]));
  it("sorts by follow-up, soonest first, empty dates last", () => expect(ids("followUpOn")).toEqual(["c", "a", "b"]));
  it("does not change the original list", () => {
    sortApplications(list, "company");
    expect(list.map((a) => a.id)).toEqual(["b", "a", "c"]);
  });
});

describe("addDays", () => {
  it("handles month and year changes", () => {
    expect(addDays("2026-11-28", 7)).toBe("2026-12-05");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });
});

describe("upcomingInterviews", () => {
  it("lists open interviews from today to 7 days ahead, soonest first", () => {
    const list = upcomingInterviews(
      [
        app({ id: "later", interviewAt: "2026-11-27T09:00", status: "Interview" }),
        app({ id: "today", interviewAt: "2026-11-22T15:00", status: "Interview" }),
        app({ id: "past", interviewAt: "2026-11-20T10:00", status: "Interview" }),
        app({ id: "far", interviewAt: "2026-12-10T10:00", status: "Interview" }),
        app({ id: "closed", interviewAt: "2026-11-23T10:00", status: "Rejected" }),
      ],
      "2026-11-22",
    );
    expect(list.map((a) => a.id)).toEqual(["today", "later"]);
  });
});

describe("dashboardStats", () => {
  it("derives every number from the list", () => {
    const stats = dashboardStats(
      [
        app({ status: "Saved" }),
        app({ status: "Applied", followUpOn: "2026-11-20" }),
        app({ status: "Applied" }),
        app({ status: "Interview", interviewAt: "2026-11-24T10:00" }),
        app({ status: "Rejected" }),
      ],
      "2026-11-22",
    );
    expect(stats.counts.All).toBe(5);
    expect(stats.followUpsDue).toBe(1);
    expect(stats.interviewsThisWeek).toBe(1);
    expect(stats.responseRate).toBe(25); // 1 interview out of 4 sent (Saved is not sent)
  });

  it("is 0% with nothing sent yet", () => {
    expect(dashboardStats([], "2026-11-22").responseRate).toBe(0);
  });
});

describe("withStatus", () => {
  it("fills in today's date when moving to Applied without one", () => {
    const moved = withStatus(app({ status: "Saved", appliedOn: "" }), "Applied", "2026-11-23");
    expect(moved).toMatchObject({ status: "Applied", appliedOn: "2026-11-23" });
  });

  it("keeps an existing application date", () => {
    expect(withStatus(app({ appliedOn: "2026-11-01" }), "Interview", "2026-11-23").appliedOn).toBe("2026-11-01");
  });
});
