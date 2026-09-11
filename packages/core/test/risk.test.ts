import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  calcRisk,
  doxyCoverage,
  getAlerts,
  nextAction,
  prepActiveOn,
  reminderSchedule,
  vaccineProtection,
  vaccineSeries,
} from "../src/risk";
import { dateString, emptyActs } from "../src/index";
import type {
  ActKey,
  Contact,
  Intercourse,
  TestRecord,
  Vaccination,
} from "../src/domain";

const daysAgo = (n: number): string =>
  dateString(new Date(Date.now() - n * 86_400_000));

const encounter = (
  id: string,
  date: string,
  acts: ActKey[],
  protectedActs: ActKey[] = [],
  cid: string | null = null,
): Intercourse => {
  const t = emptyActs();
  const p = emptyActs();
  for (const a of acts) t[a] = 1;
  for (const a of protectedActs) p[a] = 1;
  return { id, date, cid, t, p };
};

const negativePanel = (id: string, date: string): TestRecord => ({
  id,
  date,
  num: "",
  fac: "",
  ts: { HIV: 1, Gonorrhea: 1, Chlamydia: 1, Syphilis: 1 },
  results: {
    HIV: "negative",
    Gonorrhea: "negative",
    Chlamydia: "negative",
    Syphilis: "negative",
  },
});

describe("vaccineProtection", () => {
  it("requires 3 Hep B doses and 2 Mpox doses", () => {
    const dose = (type: string, n: number): Vaccination[] =>
      Array.from({ length: n }, (_, i) => ({
        id: `v${type}${i}`,
        kind: "vaccine" as const,
        type,
        date: "2024-01-01",
      }));
    expect(vaccineProtection(dose("Hep B", 2))).toEqual({});
    expect(vaccineProtection(dose("Hep B", 3))).toEqual({ "Hep B": 1 });
    expect(vaccineProtection(dose("Mpox", 1))).toEqual({});
    expect(vaccineProtection(dose("Mpox", 2))).toEqual({ Mpox: 1 });
  });
});

describe("prepActiveOn", () => {
  const prep: Vaccination[] = [
    { id: "p1", kind: "prep", startDate: "2026-01-01", endDate: "2026-03-01" },
  ];
  it("needs a 7-day lead-in", () => {
    expect(prepActiveOn(prep, "2026-01-05")).toBe(false);
    expect(prepActiveOn(prep, "2026-01-08")).toBe(true);
  });
  it("stops protecting after endDate", () => {
    expect(prepActiveOn(prep, "2026-02-15")).toBe(true);
    expect(prepActiveOn(prep, "2026-03-05")).toBe(false);
  });
});

describe("doxyCoverage", () => {
  const doxy: Vaccination[] = [{ id: "d1", kind: "doxypep", date: "2026-01-10" }];
  it("covers encounters within 72 hours of the dose", () => {
    expect(doxyCoverage(doxy, "2026-01-11")).toBe(true);
    expect(doxyCoverage(doxy, "2026-01-20")).toBe(false);
  });
});

describe("calcRisk", () => {
  it("reports no exposure without encounters", () => {
    const r = calcRisk([], [], [], "Germany");
    for (const sti of Object.keys(r.risks)) {
      expect(r.risks[sti].exposed).toBe(false);
    }
  });

  it("tracks window periods per STI from the latest exposure", () => {
    const ic = [encounter("i1", daysAgo(10), ["recAnal"])];
    const { risks } = calcRisk(ic, [], [], "Germany");
    // HIV window is 45 days — still open after 10.
    expect(risks.HIV.exposed).toBe(true);
    expect(risks.HIV.testable).toBe(false);
    // Dates are noon-anchored, so "days ago" is 9 or 10 depending on
    // whether the test runs before or after 12:00 (see audit note).
    expect(risks.HIV.days).toBeGreaterThanOrEqual(9);
    expect(risks.HIV.days).toBeLessThanOrEqual(10);
    // Gonorrhea window is 7 days — already testable.
    expect(risks.Gonorrhea.testable).toBe(true);
  });

  it("ignores encounters that predate the last test", () => {
    const ic = [encounter("i1", daysAgo(30), ["recAnal"])];
    const te = [negativePanel("t1", daysAgo(20))];
    const { risks } = calcRisk(ic, te, [], "Germany");
    expect(risks.HIV.exposed).toBe(false);
  });

  it("drops negligible exposures when condoms push risk below threshold", () => {
    // Receptive oral HIV risk is 0.00002; with a condom it falls under
    // the 1e-5 floor and should not count as exposure.
    const ic = [encounter("i1", daysAgo(5), ["recOral"], ["recOral"])];
    const { risks } = calcRisk(ic, [], [], "Germany");
    expect(risks.HIV.exposed).toBe(false);
  });

  it("suppresses HIV exposure under active PrEP but not other STIs", () => {
    const vx: Vaccination[] = [
      { id: "p1", kind: "prep", startDate: daysAgo(60), endDate: null },
    ];
    const ic = [encounter("i1", daysAgo(5), ["recAnal"])];
    const { risks } = calcRisk(ic, [], vx, "Germany");
    expect(risks.HIV.exposed).toBe(false);
    expect(risks.Gonorrhea.exposed).toBe(true);
  });

  it("marks vaccinated and preexisting STIs instead of scoring them", () => {
    const vx: Vaccination[] = [1, 2, 3].map((i) => ({
      id: `v${i}`,
      kind: "vaccine" as const,
      type: "Hep B",
      date: "2024-01-01",
    }));
    const ic = [encounter("i1", daysAgo(5), ["recAnal"])];
    const { risks } = calcRisk(ic, [], vx, "Germany", ["HSV-2"]);
    expect(risks["Hep B"]).toEqual({ exposed: false, vaccinated: true });
    expect(risks["HSV-2"]).toEqual({ exposed: false, preexisting: true });
  });

  it("collects contact ids from exposing encounters", () => {
    const ic = [
      encounter("i1", daysAgo(6), ["recAnal"], [], "c9"),
      encounter("i2", daysAgo(4), ["recAnal"], [], null),
    ];
    const { risks } = calcRisk(ic, [], [], "Germany");
    expect(risks.HIV.contactIds).toEqual(["c9"]);
    expect(risks.HIV.n).toBe(2);
  });
});

describe("calcRisk — rating explanation", () => {
  it("reports contributing encounters newest first with their acts", () => {
    const ic = [
      encounter("i1", daysAgo(20), ["recAnal", "kissing"], [], "c1"),
      encounter("i2", daysAgo(3), ["recVag"], ["recVag"], null),
    ];
    const { risks } = calcRisk(ic, [], [], "Germany");
    const c = risks.Gonorrhea.contributions ?? [];
    expect(c).toHaveLength(2);
    // newest first
    expect(c[0].date > c[1].date).toBe(true);
    // kissing cannot transmit gonorrhea, so it is not listed
    expect(c[1].acts).toEqual(["recAnal"]);
    expect(c[1].cid).toBe("c1");
    expect(c[0].acts).toEqual(["recVag"]);
    expect(c[0].protectedActs).toEqual(["recVag"]);
    expect(c[0].level).toBe("high");
  });

  it("flags doxy-PEP reduction on the encounters it covered", () => {
    const day = daysAgo(10);
    const vx = [{ id: "d1", kind: "doxypep" as const, date: day }];
    const ic = [encounter("i1", day, ["recAnal"])];
    const { risks } = calcRisk(ic, [], vx, "Germany");
    expect(risks.Gonorrhea.contributions?.[0].doxyReduced).toBe(true);
    // HIV is unaffected by doxy-PEP
    expect(risks.HIV.contributions?.[0].doxyReduced).toBe(false);
  });

  it("counts PrEP-excluded encounters instead of hiding them", () => {
    const vx = [
      { id: "p1", kind: "prep" as const, startDate: daysAgo(60), endDate: null },
    ];
    const ic = [encounter("i1", daysAgo(5), ["recAnal"])];
    const { risks } = calcRisk(ic, [], vx, "Germany");
    expect(risks.HIV.exposed).toBe(false);
    expect(risks.HIV.prepExcluded).toBe(1);
  });

  it("leaves contributions empty when nothing contributed", () => {
    const { risks } = calcRisk([], [], [], "Germany");
    expect(risks.HIV.contributions).toBeUndefined();
  });
});

describe("nextAction", () => {
  it("recommends testing when anything is past its window", () => {
    const ic = [encounter("i1", daysAgo(10), ["recAnal"])];
    const na = nextAction(calcRisk(ic, [], [], "Germany"));
    expect(na.kind).toBe("testNow");
    expect(na.testable).toContain("Gonorrhea");
  });

  it("reports the soonest closing window when nothing is testable yet", () => {
    const ic = [encounter("i1", daysAgo(1), ["recAnal"])];
    const na = nextAction(calcRisk(ic, [], [], "Germany"));
    expect(na.kind).toBe("wait");
    // Gonorrhea has the shortest window (7 days)
    expect(na.soonestSti).toBe("Gonorrhea");
    expect(na.soonestDays).toBeGreaterThanOrEqual(1);
    expect(na.soonestDays).toBeLessThanOrEqual(7);
  });

  it("is all-clear with no exposures", () => {
    expect(nextAction(calcRisk([], [], [], "Germany")).kind).toBe("allClear");
  });
});

describe("vaccineSeries", () => {
  it("tracks progress toward the recommended dose count", () => {
    const vx = [
      { id: "v1", kind: "vaccine" as const, type: "Hep B", date: "2024-01-01" },
      { id: "v2", kind: "vaccine" as const, type: "Hep B", date: "2024-02-01" },
    ];
    const series = vaccineSeries(vx);
    const hepB = series.find((s) => s.sti === "Hep B");
    expect(hepB).toEqual({ sti: "Hep B", doses: 2, target: 3, complete: false });
    const mpox = series.find((s) => s.sti === "Mpox");
    expect(mpox).toEqual({ sti: "Mpox", doses: 0, target: 2, complete: false });
  });

  it("caps displayed doses at the target once complete", () => {
    const vx = [1, 2, 3, 4].map((i) => ({
      id: `v${i}`,
      kind: "vaccine" as const,
      type: "Hep B",
      date: "2024-01-01",
    }));
    const hepB = vaccineSeries(vx).find((s) => s.sti === "Hep B");
    expect(hepB?.doses).toBe(3);
    expect(hepB?.complete).toBe(true);
  });
});

describe("getAlerts", () => {
  it("targets partners between the last negative and the positive test", () => {
    const contacts: Contact[] = [
      { id: "c1", name: "A", notes: null, token: "a".repeat(24), cx: {} },
      { id: "c2", name: "B", notes: null, token: "b".repeat(24), cx: {} },
    ];
    const tests: TestRecord[] = [
      negativePanel("t1", "2026-01-01"),
      {
        id: "t2",
        date: "2026-02-01",
        num: "",
        fac: "",
        ts: { Syphilis: 1 },
        results: { Syphilis: "positive" },
      },
    ];
    const ic = [
      // before the negative test — out of scope
      encounter("i0", "2025-12-20", ["recAnal"], [], "c2"),
      // in the window — should be alerted
      encounter("i1", "2026-01-15", ["recAnal"], [], "c1"),
      // anonymous in the window
      encounter("i2", "2026-01-20", ["recAnal"], [], null),
    ];
    const alerts = getAlerts(tests, ic, contacts);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].sti).toBe("Syphilis");
    expect(alerts[0].contacts.map((c) => c.id)).toEqual(["c1"]);
    expect(alerts[0].hasAnon).toBe(true);
  });
});

describe("reminderSchedule", () => {
  const vx: Vaccination[] = [];

  // The schedule is arithmetic on today's date, and `daysAgo` reads the
  // same clock. Left to the real one, the expectations below flip when
  // the test runs across midnight — which is exactly what happened.
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 27, 15, 0, 0));
  });
  afterAll(() => vi.useRealTimers());

  it("names the day a window closes, counted from the exposure", () => {
    // Gonorrhoea's window is 7 days; an encounter 2 days ago closes in 5.
    const report = calcRisk(
      [encounter("e1", daysAgo(2), ["recAnal"])],
      [],
      vx,
      "Germany",
    );
    const gonorrhoea = reminderSchedule(report, "2026-08-27").find((r) =>
      r.stis.includes("Gonorrhea"),
    );
    expect(gonorrhoea?.inDays).toBe(5);
    expect(gonorrhoea?.date).toBe("2026-09-01");
  });

  it("puts everything that opens on one day into one reminder", () => {
    const report = calcRisk(
      [encounter("e1", daysAgo(1), ["recAnal"])],
      [],
      vx,
      "Germany",
    );
    const schedule = reminderSchedule(report, "2026-08-27");
    const dates = schedule.map((r) => r.date);
    expect(new Set(dates).size).toBe(dates.length);
    // HIV and Hep B share a 45-day window, so they share a reminder.
    const shared = schedule.find((r) => r.stis.includes("HIV"));
    expect(shared?.stis).toContain("Hep B");
  });

  it("is ordered by how soon it is due", () => {
    const report = calcRisk(
      [encounter("e1", daysAgo(1), ["recAnal"])],
      [],
      vx,
      "Germany",
    );
    const days = reminderSchedule(report).map((r) => r.inDays);
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(days.every((d) => d >= 1)).toBe(true);
  });

  it("says nothing about windows that have already closed", () => {
    // 60 days out, every window in the database has passed.
    const report = calcRisk(
      [encounter("e1", daysAgo(60), ["recAnal"])],
      [],
      vx,
      "Germany",
    );
    expect(reminderSchedule(report)).toEqual([]);
  });

  it("says nothing when there was no exposure", () => {
    expect(reminderSchedule(calcRisk([], [], vx, "Germany"))).toEqual([]);
  });
});
