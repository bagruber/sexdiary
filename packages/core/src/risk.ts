import {
  HIGH_PREVALENCE,
  STI_DB,
  STI_NAMES,
  type StiTx,
} from "./stis.js";
import {
  RISK_ORDER,
  type ActKey,
  type Contact,
  type Intercourse,
  type RiskLevel,
  type TestRecord,
  type Vaccination,
} from "./domain.js";
import { toDate } from "./date.js";

/**
 * One encounter that contributed to an STI's rating, with the reasons.
 * This is what makes a rating explainable: the UI can show the user
 * exactly which encounters drove the number and which protections were
 * applied, rather than an opaque score.
 */
export interface RiskContribution {
  date: string;
  cid: string | null;
  /** Acts from this encounter that could transmit this STI. */
  acts: ActKey[];
  /** Subset of `acts` where protection was recorded. */
  protectedActs: ActKey[];
  /** Doxy-PEP was active and reduced this encounter's transmission rate. */
  doxyReduced: boolean;
  /** Highest risk level among the contributing acts. */
  level: RiskLevel;
}

export interface RiskData {
  exposed: boolean;
  vaccinated?: boolean;
  preexisting?: boolean;
  testable?: boolean;
  wPct?: number;
  days?: number;
  mr?: RiskLevel;
  sym?: string[];
  wd?: number;
  n?: number;
  allP?: boolean;
  highPrev?: boolean;
  isPositive?: boolean;
  contactIds?: string[];
  /** Encounter-level breakdown, newest first. Empty when not exposed. */
  contributions?: RiskContribution[];
  /** Encounters excluded because PrEP was active (HIV only). */
  prepExcluded?: number;
}

export interface LastTestEntry {
  date: string;
  result: "negative" | "positive";
}

export interface RiskReport {
  lastTest: TestRecord | null;
  risks: Record<string, RiskData>;
  lastMap: Record<string, LastTestEntry>;
}

export function vaccineProtection(vx: Vaccination[]): Record<string, 1> {
  const p: Record<string, 1> = {};
  if (vx.filter((v) => v.kind === "vaccine" && v.type === "Hep B").length >= 3)
    p["Hep B"] = 1;
  if (vx.filter((v) => v.kind === "vaccine" && v.type === "Mpox").length >= 2)
    p.Mpox = 1;
  return p;
}

export function prepActiveOn(vx: Vaccination[], date: string): boolean {
  const dt = toDate(date);
  for (const v of vx) {
    if (v.kind !== "prep" || !v.startDate) continue;
    if (dt < new Date(toDate(v.startDate).getTime() + 7 * 86_400_000)) continue;
    if (v.endDate && dt > toDate(v.endDate)) continue;
    return true;
  }
  return false;
}

export function doxyCoverage(vx: Vaccination[], date: string): boolean {
  const dt = toDate(date);
  for (const v of vx) {
    if (v.kind !== "doxypep" || !v.date) continue;
    if (Math.abs(dt.getTime() - toDate(v.date).getTime()) / 3_600_000 <= 72)
      return true;
  }
  return false;
}

export function calcRisk(
  ic: Intercourse[],
  te: TestRecord[],
  vx: Vaccination[],
  country: string,
  conditions: string[] = [],
): RiskReport {
  const todayDate = new Date();
  const sorted = [...te].sort(
    (a, b) => toDate(b.date).getTime() - toDate(a.date).getTime(),
  );
  const last = sorted[0] ?? null;
  const cut = last
    ? new Date(toDate(last.date).getTime() + 86_400_000 - 1)
    : null;
  const relevant = ic.filter((e) => !cut || toDate(e.date) > cut);

  const vp = vaccineProtection(vx);
  const hp = HIGH_PREVALENCE[country] ?? [];
  const lastMap: Record<string, LastTestEntry> = {};
  for (const sti of STI_NAMES) {
    for (const t of sorted) {
      if (t.ts[sti]) {
        lastMap[sti] = {
          date: t.date,
          result: (t.results?.[sti] ?? "negative") as "negative" | "positive",
        };
        break;
      }
    }
  }

  const condSet = new Set(conditions);
  const risks: Record<string, RiskData> = {};
  for (const [sn, si] of Object.entries(STI_DB)) {
    if (condSet.has(sn)) {
      risks[sn] = { exposed: false, preexisting: true };
      continue;
    }
    if (vp[sn]) {
      risks[sn] = { exposed: false, vaccinated: true };
      continue;
    }
    const exposures: {
      date: Date;
      rl: RiskLevel;
      isP: boolean;
      cid: string | null;
    }[] = [];
    const contributions: RiskContribution[] = [];
    let prepExcluded = 0;

    for (const e of relevant) {
      if (sn === "HIV" && prepActiveOn(vx, e.date)) {
        // PrEP suppresses HIV acquisition; the encounter still happened,
        // so surface it as excluded rather than dropping it silently.
        if (Object.values(e.t).some((v) => v)) prepExcluded++;
        continue;
      }
      const acts: ActKey[] = [];
      const protectedActs: ActKey[] = [];
      let doxyReduced = false;
      let level: RiskLevel = "none";

      for (const key of Object.keys(e.t) as (keyof typeof e.t)[]) {
        if (!e.t[key]) continue;
        const tr = si.tx[key] as StiTx | undefined;
        if (!tr || tr.p === 0) continue;
        let rate = e.p[key] ? tr.p * (1 - tr.c) : tr.p;
        let reduced = false;
        if (
          ["Gonorrhea", "Chlamydia", "Syphilis"].includes(sn) &&
          doxyCoverage(vx, e.date)
        ) {
          rate *= 0.25;
          reduced = true;
        }
        if (rate > 0.00001) {
          exposures.push({
            date: toDate(e.date),
            rl: tr.r,
            isP: !!e.p[key],
            cid: e.cid,
          });
          acts.push(key);
          if (e.p[key]) protectedActs.push(key);
          if (reduced) doxyReduced = true;
          if (RISK_ORDER[tr.r] > RISK_ORDER[level]) level = tr.r;
        }
      }

      if (acts.length) {
        contributions.push({
          date: e.date,
          cid: e.cid,
          acts,
          protectedActs,
          doxyReduced,
          level,
        });
      }
    }

    if (!exposures.length) {
      risks[sn] = {
        exposed: false,
        ...(prepExcluded ? { prepExcluded } : {}),
      };
      continue;
    }
    const latest = exposures.reduce((a, b) => (a.date > b.date ? a : b));
    const days = Math.floor(
      (todayDate.getTime() - latest.date.getTime()) / 86_400_000,
    );
    const mr = exposures.reduce<RiskLevel>(
      (m, e) => (RISK_ORDER[e.rl] > RISK_ORDER[m] ? e.rl : m),
      "none",
    );

    risks[sn] = {
      exposed: true,
      testable: days >= si.wd,
      wPct: Math.min(days / si.wd, 1),
      days,
      mr,
      sym: si.sym,
      wd: si.wd,
      n: exposures.length,
      allP: exposures.every((e) => e.isP),
      highPrev: hp.includes(sn),
      isPositive: lastMap[sn]?.result === "positive",
      contactIds: [
        ...new Set(exposures.map((e) => e.cid).filter((x): x is string => !!x)),
      ],
      contributions: contributions.sort((a, b) => (a.date < b.date ? 1 : -1)),
      ...(prepExcluded ? { prepExcluded } : {}),
    };
  }

  return { lastTest: last, risks, lastMap };
}

// ─── Derived guidance ─────────────────────────────────────────────────

export type NextActionKind = "testNow" | "wait" | "allClear";

/**
 * The single most useful sentence to put in front of the user. The
 * per-STI cards are the detail view; this is the summary that answers
 * "what should I actually do?".
 */
export interface NextAction {
  kind: NextActionKind;
  /** STIs that are past their window period and worth testing for now. */
  testable: string[];
  /** STI whose window closes soonest, when nothing is testable yet. */
  soonestSti?: string;
  /** Days until that window closes (>= 1). */
  soonestDays?: number;
}

export function nextAction(report: RiskReport): NextAction {
  const testable: string[] = [];
  let soonestSti: string | undefined;
  let soonestDays = Infinity;

  for (const [sti, r] of Object.entries(report.risks)) {
    if (!r.exposed) continue;
    if (r.testable) {
      testable.push(sti);
      continue;
    }
    const remaining = Math.max((r.wd ?? 0) - (r.days ?? 0), 1);
    if (remaining < soonestDays) {
      soonestDays = remaining;
      soonestSti = sti;
    }
  }

  if (testable.length) return { kind: "testNow", testable };
  if (soonestSti) {
    return { kind: "wait", testable, soonestSti, soonestDays };
  }
  return { kind: "allClear", testable };
}

export interface VaccineSeries {
  sti: string;
  doses: number;
  target: number;
  complete: boolean;
}

/** Dose counts against the recommended series, for progress display. */
export function vaccineSeries(vx: Vaccination[]): VaccineSeries[] {
  const targets: Record<string, number> = { "Hep B": 3, Mpox: 2 };
  return Object.entries(targets).map(([sti, target]) => {
    const doses = vx.filter(
      (v) => v.kind === "vaccine" && v.type === sti,
    ).length;
    return { sti, doses: Math.min(doses, target), target, complete: doses >= target };
  });
}

export interface AlertGroup {
  sti: string;
  testDate: string;
  contacts: Contact[];
  hasAnon: boolean;
}

export function getAlerts(
  te: TestRecord[],
  ic: Intercourse[],
  con: Contact[],
): AlertGroup[] {
  const sorted = [...te].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime(),
  );
  const alerts: AlertGroup[] = [];
  for (const test of sorted) {
    if (!test.results) continue;
    for (const [sti, result] of Object.entries(test.results)) {
      if (result !== "positive") continue;
      const prev = sorted
        .filter(
          (t) =>
            toDate(t.date).getTime() < toDate(test.date).getTime() &&
            t.results?.[sti] === "negative",
        )
        .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())[0];
      const after = prev ? prev.date : "2000-01-01";
      const cids = [
        ...new Set(
          ic
            .filter(
              (e) =>
                e.date > after && e.date <= test.date && e.cid != null,
            )
            .map((e) => e.cid as string),
        ),
      ];
      const cs = cids
        .map((cid) => con.find((c) => c.id === cid))
        .filter((x): x is Contact => !!x);
      const hasAnon = ic.some(
        (e) => e.date > after && e.date <= test.date && !e.cid,
      );
      alerts.push({ sti, testDate: test.date, contacts: cs, hasAnon });
    }
  }
  return alerts;
}

export interface ProtectionSummary {
  prep: { active: boolean; since?: string };
  doxy: { recent: boolean; date?: string };
  vaccines: { sti: string; status: "immune" | "partial"; doses: number }[];
}

export function summarizeProtections(
  vx: Vaccination[],
  asOf: string,
): ProtectionSummary {
  const prepEntry = vx.find(
    (v) =>
      v.kind === "prep" &&
      v.startDate &&
      toDate(v.startDate) <= toDate(asOf) &&
      (!v.endDate || toDate(v.endDate) >= toDate(asOf)),
  );
  const prep = prepEntry
    ? { active: prepActiveOn(vx, asOf), since: prepEntry.startDate }
    : { active: false };
  const doxy = vx
    .filter((v) => v.kind === "doxypep" && v.date)
    .sort(
      (a, b) =>
        toDate(b.date as string).getTime() -
        toDate(a.date as string).getTime(),
    )[0];
  const doxyRecent = doxy ? doxyCoverage(vx, asOf) : false;

  const hepDoses = vx.filter(
    (v) => v.kind === "vaccine" && v.type === "Hep B",
  ).length;
  const mpoxDoses = vx.filter(
    (v) => v.kind === "vaccine" && v.type === "Mpox",
  ).length;
  const vaccines: ProtectionSummary["vaccines"] = [];
  if (hepDoses > 0)
    vaccines.push({
      sti: "Hep B",
      status: hepDoses >= 3 ? "immune" : "partial",
      doses: hepDoses,
    });
  if (mpoxDoses > 0)
    vaccines.push({
      sti: "Mpox",
      status: mpoxDoses >= 2 ? "immune" : "partial",
      doses: mpoxDoses,
    });

  return {
    prep,
    doxy: { recent: doxyRecent, date: doxy?.date },
    vaccines,
  };
}
