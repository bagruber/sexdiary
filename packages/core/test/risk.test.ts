import { describe, expect, it } from "vitest";
import {
  calcRisk,
  doxyCoverage,
  getAlerts,
  prepActiveOn,
  vaccineProtection,
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
