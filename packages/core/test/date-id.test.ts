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
