import { describe, expect, it } from "vitest";
import { EMPTY_INPUT, normalizeApplication, normalizeList, validateInput } from "./validation";

describe("normalizeApplication", () => {
  it("loads an item saved by the first version (no new fields) with safe empty values", () => {
    const v1 = {
      id: "old",
      company: "Acme",
      role: "Junior Web Developer",
      status: "Applied",
      source: "LinkedIn",
      appliedOn: "2026-11-10",
    };
    const result = normalizeApplication(v1);
    expect(result).toMatchObject({
      id: "old",
      salaryRange: "",
      employmentType: "",
      workplaceType: "",
      contact: "",
      interviewAt: "",
      resumeVersion: "",
      nextAction: "",
    });
  });

  it("keeps valid new fields and drops invalid ones", () => {
    const result = normalizeApplication({
      company: "Beta",
      role: "Dev",
      employmentType: "Full-time",
      workplaceType: "Spaceship", // not an option
      interviewAt: "2026-11-25T14:30",
    });
    expect(result?.employmentType).toBe("Full-time");
    expect(result?.workplaceType).toBe("");
    expect(result?.interviewAt).toBe("2026-11-25T14:30");

    expect(normalizeApplication({ company: "C", role: "D", interviewAt: "next Tuesday" })?.interviewAt).toBe("");
  });

  it("returns null without a company or role", () => {
    expect(normalizeApplication({ company: "Only company" })).toBeNull();
    expect(normalizeApplication("not an object")).toBeNull();
  });
});

describe("normalizeList", () => {
  it("skips broken items instead of failing the whole list", () => {
    const list = normalizeList([{ company: "A", role: "B" }, { nope: true }, null]);
    expect(list).toHaveLength(1);
  });

  it("fixes duplicate ids so two applications never share one", () => {
    const list = normalizeList([
      { id: "same", company: "A", role: "B" },
      { id: "same", company: "C", role: "D" },
    ]);
    expect(list[0].id).toBe("same");
    expect(list[1].id).not.toBe("same");
  });

  it("returns an empty list for anything that is not an array", () => {
    expect(normalizeList({ company: "A" })).toEqual([]);
  });
});

describe("validateInput", () => {
  it("passes a minimal valid input", () => {
    expect(validateInput({ ...EMPTY_INPUT, company: "Acme", role: "Dev" })).toEqual({});
  });

  it("requires company and role with friendly messages", () => {
    expect(validateInput(EMPTY_INPUT)).toEqual({
      company: "Enter the company name.",
      role: "Enter the job title.",
    });
  });

  it("asks for a full link", () => {
    const errors = validateInput({ ...EMPTY_INPUT, company: "A", role: "B", url: "jobstreet.com/job/1" });
    expect(errors.url).toBe("Paste the full link, starting with https://");
  });

  it("flags a follow-up date before the application date", () => {
    const errors = validateInput({
      ...EMPTY_INPUT,
      company: "A",
      role: "B",
      appliedOn: "2026-11-20",
      followUpOn: "2026-11-18",
    });
    expect(errors.followUpOn).toBe("The follow-up date is before the date you applied.");
  });
});
