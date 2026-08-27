import {
  ACT_KEYS,
  type ActKey,
  type AppData,
  type Contact,
  type Intercourse,
  type Lang,
  type Profile,
  type Preferences,
  type TestRecord,
  type Vaccination,
} from "./domain.js";
import { genToken } from "./id.js";

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

const EN_NAMES = ["Alex", "Jamie", "Sam", "Emily", "Chris"];
const DE_NAMES = ["Anna", "Lukas", "Julia", "Tim", "Laura"];

const NOTES_EN: (string | null)[] = [
  null,
  "Met on New Year's",
  null,
  "College friend",
  "Festival",
];
const NOTES_DE: (string | null)[] = [
  null,
  "Silvester kennengelernt",
  null,
  "Aus dem Studium",
  "Festival",
];

const TOKENS = [
  "a3f8c1d902e74b6f19a8c3d2",
  "7e2b9f01c4a83d56e1f20b97",
  "d4e601a8b3f29c7502eadf18",
  "91c7f3e840b26d5a03fe82c1",
  "55fb3aa7b91d80c4e210a6f9",
];

const CX_BY_INDEX: Contact["cx"][] = [
  {},
  { instagram: "@jameson", telegram: "jameson_x" },
  { signal: "+49 176 1234567" },
  { whatsapp: "+44 7700 900123", instagram: "@em.j" },
  {},
];

function seedContacts(lang: Lang): Contact[] {
  const names = lang === "de" ? DE_NAMES : EN_NAMES;
  const notes = lang === "de" ? NOTES_DE : NOTES_EN;
  return names.map((name, i) => ({
    id: `c${i + 1}`,
    name,
    notes: notes[i],
    token: TOKENS[i],
    cx: CX_BY_INDEX[i],
  }));
}

// Historical entries (kept) plus fresh ones spanning April–May 2026 so
// that the dashboard shows a mix of testable and still-in-window STIs.
export const SEED_INTERCOURSE: Intercourse[] = [
  mkEntry("i1", "2025-11-15", "c1", ["recAnal", "insOral", "kissing"], []),
  mkEntry("i2", "2025-11-28", "c2", ["insAnal", "recOral", "manual", "kissing"], ["insAnal"]),
  mkEntry("i3", "2025-12-05", "c4", ["recVag", "insOral", "manual", "kissing"], []),
  mkEntry("i4", "2025-12-12", "c3", ["recAnal", "recOral"], []),
  mkEntry("i5", "2025-12-20", "c1", ["insOral", "recOral", "manual", "kissing"], []),
  mkEntry("i6", "2026-01-15", "c2", ["recAnal", "insOral", "kissing"], ["recAnal"]),
  mkEntry("i7", "2026-01-22", null, ["insAnal", "kissing"], []),
  mkEntry("i8", "2026-02-01", "c3", ["recOral", "insOral", "manual"], []),
  mkEntry("i9", "2026-02-20", "c1", ["recAnal", "insOral", "kissing"], []),
  mkEntry("i10", "2026-03-01", "c2", ["insAnal", "recOral", "manual", "kissing"], ["insAnal"]),
  mkEntry("i11", "2026-03-05", "c4", ["recVag", "kissing"], []),
  // ─── post-April test (t3 2026-04-15) — gives a mix of testable / in-window today ───
  mkEntry("i12", "2026-04-18", "c5", ["recAnal", "kissing"], []),
  mkEntry("i13", "2026-04-25", "c2", ["insOral", "recOral", "manual", "kissing"], []),
  mkEntry("i14", "2026-05-08", null, ["kissing", "manual"], []),
];

export const SEED_TESTS: TestRecord[] = [
  {
    id: "t1",
    date: "2026-01-03",
    num: "T-2026-001",
    fac: "City Health Clinic",
    ts: { HIV: 1, Gonorrhea: 1, Chlamydia: 1, Syphilis: 1 },
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
    ts: { HIV: 1, Gonorrhea: 1, Chlamydia: 1, Syphilis: 1, "Hep B": 1 },
    results: {
      HIV: "negative",
      Gonorrhea: "negative",
      Chlamydia: "negative",
      Syphilis: "negative",
      "Hep B": "negative",
    },
  },
  {
    id: "t3",
    date: "2026-04-15",
    num: "T-2026-003",
    fac: "City Health Clinic",
    ts: {
      HIV: 1,
      Gonorrhea: 1,
      Chlamydia: 1,
      Syphilis: 1,
      "Hep B": 1,
      "HSV-2": 1,
    },
    results: {
      HIV: "negative",
      Gonorrhea: "negative",
      Chlamydia: "negative",
      Syphilis: "negative",
      "Hep B": "negative",
      "HSV-2": "negative",
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

export const SEED_PROFILE: Profile = { age: "", pa: "both", conditions: [] };

const BASE_PREFS: Preferences = {
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
  disguise: false,
  lockPin: null,
};

/**
 * Fresh default state, seeded with demo data. Language is passed in by
 * the host platform (browser: navigator.language, mobile: OS locale) —
 * core stays platform-free.
 */
export function freshAppData(lang: Lang = "en"): AppData {
  return {
    contacts: seedContacts(lang),
    intercourse: SEED_INTERCOURSE,
    tests: SEED_TESTS,
    vaccinations: SEED_VACCINATIONS,
    profile: { ...SEED_PROFILE },
    prefs: { ...BASE_PREFS, lang },
    myToken: genToken(),
    onboarded: false,
  };
}

export const SEED_PREFS = BASE_PREFS;
