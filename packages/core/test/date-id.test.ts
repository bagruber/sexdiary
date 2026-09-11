import { describe, expect, it } from "vitest";
import { dateString, daysBetween, formatDate, toDate, today } from "../src/date";
import { genToken, gid } from "../src/id";

describe("date utils", () => {
  it("round-trips YYYY-MM-DD through toDate/dateString", () => {
    expect(dateString(toDate("2026-02-28"))).toBe("2026-02-28");
    expect(dateString(toDate("2026-12-01"))).toBe("2026-12-01");
  });

  it("computes day differences", () => {
    expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
    expect(daysBetween("2026-01-31", "2026-01-01")).toBe(-30);
  });

  it("formats per language", () => {
    expect(formatDate("2026-03-05", "de")).toContain("2026");
    expect(formatDate("2026-03-05", "en")).toContain("2026");
  });

  it("today() is a valid ISO date", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("id generation", () => {
  it("generates 96-bit hex tokens", () => {
    const t = genToken();
    expect(t).toMatch(/^[0-9a-f]{24}$/);
    expect(genToken()).not.toBe(t);
  });

  it("generates prefixed, collision-resistant record ids", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => gid("t")));
    expect(ids.size).toBe(1000);
    expect([...ids][0]).toMatch(/^t_[0-9a-f]{16}$/);
  });
});

describe("daysBetween counts calendar days", () => {
  it("does not depend on the time of day", () => {
    // The bug this replaces: an encounter logged before noon came out
    // as -1 days old, because a date anchored at 12:00 was subtracted
    // from the wall clock.
    const morning = new Date(2026, 7, 27, 0, 2);
    const evening = new Date(2026, 7, 27, 23, 58);
    expect(daysBetween("2026-08-27", morning)).toBe(0);
    expect(daysBetween("2026-08-27", evening)).toBe(0);
    expect(daysBetween("2026-08-26", morning)).toBe(1);
  });

  it("survives the daylight-saving changes", () => {
    // 2026: clocks forward 29 March, back 25 October (CET/CEST).
    expect(daysBetween("2026-03-28", "2026-03-29")).toBe(1);
    expect(daysBetween("2026-10-24", "2026-10-25")).toBe(1);
    expect(daysBetween("2026-03-01", "2026-11-01")).toBe(245);
  });
});
