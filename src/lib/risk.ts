import {
  HIGH_PREVALENCE,
  STI_DB,
  STI_NAMES,
  type StiTx,
} from "../data/stis";
import {
  RISK_ORDER,
  type Contact,
  type Intercourse,
  type RiskLevel,
  type TestRecord,
  type Vaccination,
} from "../types/domain";
import { toDate } from "./date";

export interface RiskData {
  exposed: boolean;
  vaccinated?: boolean;
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

  const risks: Record<string, RiskData> = {};
  for (const [sn, si] of Object.entries(STI_DB)) {
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

    for (const e of relevant) {
      for (const key of Object.keys(e.t) as (keyof typeof e.t)[]) {
        if (!e.t[key]) continue;
        const tr = si.tx[key] as StiTx | undefined;
        if (!tr || tr.p === 0) continue;
        let rate = e.p[key] ? tr.p * (1 - tr.c) : tr.p;
        if (sn === "HIV" && prepActiveOn(vx, e.date)) continue;
        if (
          ["Gonorrhea", "Chlamydia", "Syphilis"].includes(sn) &&
          doxyCoverage(vx, e.date)
        ) {
          rate *= 0.25;
        }
        if (rate > 0.00001) {
          exposures.push({
            date: toDate(e.date),
            rl: tr.r,
            isP: !!e.p[key],
            cid: e.cid,
          });
        }
      }
    }

    if (!exposures.length) {
      risks[sn] = { exposed: false };
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
    };
  }

  return { lastTest: last, risks, lastMap };
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
