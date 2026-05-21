import {
  ACT_KEYS,
  type ActKey,
  type Contact,
  type Intercourse,
  type Profile,
  type Preferences,
  type TestRecord,
  type Vaccination,
} from "../types/domain";
import { genToken } from "../lib/id";

const mkEntry = (
  id: string,
  date: string,
  cid: string | null,
  acts: ActKey[],
  prots: ActKey[],
): Intercourse => ({
  id,
  date,
  cid,
  t: Object.fromEntries(
    ACT_KEYS.map((k) => [k, acts.includes(k) ? 1 : 0]),
  ) as Intercourse["t"],
  p: Object.fromEntries(
    ACT_KEYS.map((k) => [k, prots.includes(k) ? 1 : 0]),
  ) as Intercourse["p"],
});

export const SEED_CONTACTS: Contact[] = [
  { id: "c1", name: "Alex", notes: null, token: "a3f8c1d902e74b6f19a8c3d2", cx: {} },
  {
    id: "c2",
    name: "Jordan",
    notes: "Met on New Year's",
    token: "7e2b9f01c4a83d56e1f20b97",
    cx: { instagram: "@jordanxo", telegram: "jordanplus" },
  },
  { id: "c3", name: "Sam", notes: null, token: "d4e601a8b3f29c7502eadf18", cx: { signal: "+49 176 1234567" } },
  {
    id: "c4",
    name: "Riley",
    notes: "College friend",
    token: "91c7f3e840b26d5a03fe82c1",
    cx: { whatsapp: "+44 7700 900123", instagram: "@riley.j" },
  },
];

export const SEED_INTERCOURSE: Intercourse[] = [
  mkEntry("i1", "2025-11-15", "c1", ["recAnal", "insOral", "kissing"], []),
  mkEntry(
    "i2",
    "2025-11-28",
    "c2",
    ["insAnal", "recOral", "manual", "kissing"],
    ["insAnal"],
  ),
  mkEntry("i3", "2025-12-05", "c4", ["recVag", "insOral", "manual", "kissing"], []),
  mkEntry("i4", "2025-12-12", "c3", ["recAnal", "recOral"], []),
  mkEntry("i5", "2025-12-20", "c1", ["insOral", "recOral", "manual", "kissing"], []),
  mkEntry("i6", "2026-01-15", "c2", ["recAnal", "insOral", "kissing"], ["recAnal"]),
  mkEntry("i7", "2026-01-22", null, ["insAnal", "kissing"], []),
  mkEntry("i8", "2026-02-01", "c3", ["recOral", "insOral", "manual"], []),
  mkEntry("i9", "2026-02-20", "c1", ["recAnal", "insOral", "kissing"], []),
  mkEntry(
    "i10",
    "2026-03-01",
    "c2",
    ["insAnal", "recOral", "manual", "kissing"],
    ["insAnal"],
  ),
  mkEntry("i11", "2026-03-05", "c4", ["recVag", "kissing"], []),
];

export const SEED_TESTS: TestRecord[] = [
  {
    id: "t1",
    date: "2026-01-03",
    num: "T-2026-001",
    fac: "City Health Clinic",
    ts: {
      HIV: 1,
      Gonorrhea: 1,
      Chlamydia: 1,
      Syphilis: 1,
      "Hep B": 0,
      "HSV-2": 0,
      Mpox: 0,
    },
    results: {
      HIV: "negative",
      Gonorrhea: "negative",
      Chlamydia: "negative",
      Syphilis: "negative",
    },
  },
  {
    id: "t2",
    date: "2026-02-10",
    num: "T-2026-002",
    fac: "QuickTest Center",
    ts: {
      HIV: 1,
      Gonorrhea: 1,
      Chlamydia: 1,
      Syphilis: 1,
      "Hep B": 1,
      "HSV-2": 0,
      Mpox: 0,
    },
    results: {
      HIV: "negative",
      Gonorrhea: "negative",
      Chlamydia: "negative",
      Syphilis: "negative",
      "Hep B": "negative",
    },
  },
];

export const SEED_VACCINATIONS: Vaccination[] = [
  { id: "v1", kind: "vaccine", type: "Hep B", manufacturer: "Engerix-B", date: "2024-03-10", dose: 1 },
  { id: "v2", kind: "vaccine", type: "Hep B", manufacturer: "Engerix-B", date: "2024-04-10", dose: 2 },
  { id: "v3", kind: "vaccine", type: "Hep B", manufacturer: "Engerix-B", date: "2024-09-10", dose: 3 },
  { id: "v4", kind: "vaccine", type: "Mpox", manufacturer: "Jynneos", date: "2025-06-01", dose: 1 },
  { id: "v5", kind: "doxypep", date: "2026-01-15" },
  { id: "v6", kind: "prep", startDate: "2026-02-01", endDate: null },
];

export const SEED_PROFILE: Profile = { age: "", pa: "both", cond: "none" };

export const SEED_PREFS: Preferences = {
  lang: "en",
  theme: "system",
  country: "Germany",
  notifs: false,
  lock: true,
  highPrev: true,
  reducedMotion: false,
  hideLowRisk: false,
  shareMode: "token",
  sharePlatform: "instagram",
  shareHandle: "",
};

export function freshAppData() {
  return {
    contacts: SEED_CONTACTS,
    intercourse: SEED_INTERCOURSE,
    tests: SEED_TESTS,
    vaccinations: SEED_VACCINATIONS,
    profile: SEED_PROFILE,
    prefs: SEED_PREFS,
    myToken: genToken(),
    onboarded: false,
  };
}
