import { describe, expect, it } from "vitest";
import { detectSource } from "./detect-source";

describe("detectSource", () => {
  it("finds each job board from its link", () => {
    expect(detectSource("https://www.linkedin.com/jobs/view/123")).toBe("LinkedIn");
    expect(detectSource("https://ph.indeed.com/viewjob?jk=abc")).toBe("Indeed");
    expect(detectSource("https://ph.jobstreet.com/job/456")).toBe("JobStreet");
    expect(detectSource("https://www.kalibrr.com/c/acme/jobs/1")).toBe("Kalibrr");
    expect(detectSource("https://www.onlinejobs.ph/jobseekers/job/1")).toBe("OnlineJobs.ph");
  });

  it("ignores spaces and capital letters", () => {
    expect(detectSource("  HTTPS://WWW.LINKEDIN.COM/jobs  ")).toBe("LinkedIn");
  });

  it("returns null for unknown sites and unfinished links", () => {
    expect(detectSource("https://careers.example.com/job/1")).toBeNull();
    expect(detectSource("linked")).toBeNull();
    expect(detectSource("")).toBeNull();
  });

  it("is not fooled by look-alike domains", () => {
    // contains "indeed.com" but is a different website
    expect(detectSource("https://fake-indeed.com.evil.example/job")).toBeNull();
    expect(detectSource("https://notlinkedin.com/jobs")).toBeNull();
  });
});
