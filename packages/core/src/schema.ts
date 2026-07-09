/**
 * Schemas and validation for externally supplied payloads. Everything
 * parsed here is untrusted input — QR codes are scanned from strangers,
 * backup files may be hand-edited or corrupted — so every field is
 * validated and length-capped before it can enter the store.
 *
 * Test result QR payload:
 *   {
 *     "v": 1,
 *     "type": "test_result",
 *     "date": "YYYY-MM-DD",
 *     "facility": "string",
 *     "num": "string",
 *     "ts": { "HIV": 1, "Gonorrhea": 1, ... },
 *     "results": { "HIV": "negative", "Syphilis": "positive", ... }
 *   }
 *
 * Contact-exchange QR payload:
 *   {
 *     "v": 1,
 *     "type": "contact",
 *     "token": "hex string (16–64 chars)",
 *     "platform": "instagram" | "telegram" | ... (optional),
 *     "handle": "@name" (optional),
 *     "name": "display name" (optional)
 *   }
 *
 * Full data backup payload (file import, not QR — too large):
 *   { contacts, intercourse, tests, vaccinations, profile }
 */

import {
  ACT_KEYS,
  emptyActs,
  type ActFlags,
  type Contact,
  type ContactHandlePlatform,
  type Intercourse,
  type Profile,
  type TestRecord,
  type TestResultValue,
  type Vaccination,
} from "./domain";
import { gid } from "./id";

export interface TestResultPayload {
  v: 1;
  type: "test_result";
  date: string;
  facility: string;
  num: string;
  ts: Record<string, 0 | 1>;
  results: Record<string, TestResultValue>;
}

export interface ContactPayload {
  v: 1;
  type: "contact";
  token: string;
  platform?: ContactHandlePlatform;
  handle?: string;
  name?: string;
}

export type ImportPayload = TestResultPayload | ContactPayload;
export type ImportResult =
  | { kind: "test"; record: TestRecord }
  | { kind: "contact"; record: Contact }
  | { kind: "error"; reason: string };

/** QR payloads are small by nature; anything bigger is not ours. */
const MAX_QR_PAYLOAD_CHARS = 20_000;
/** Backup files scale with usage but a cap still bounds memory. */
const MAX_BACKUP_CHARS = 5_000_000;
const MAX_TEXT_FIELD = 200;
const MAX_STI_ENTRIES = 40;

const PLATFORMS: ContactHandlePlatform[] = [
  "instagram",
  "telegram",
  "signal",
  "whatsapp",
  "snapchat",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: unknown): s is string {
  if (typeof s !== "string" || !ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

const isToken = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{16,64}$/i.test(s);

const clip = (s: unknown, fallback = ""): string =>
  typeof s === "string" ? s.slice(0, MAX_TEXT_FIELD) : fallback;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Keep only string keys with 0|1 values, capped in count and key length. */
function sanitizeTsMap(v: unknown): Record<string, 0 | 1> | null {
  if (!isRecord(v)) return null;
  const out: Record<string, 0 | 1> = {};
  for (const [k, val] of Object.entries(v).slice(0, MAX_STI_ENTRIES)) {
    if (val === 0 || val === 1) out[k.slice(0, 40)] = val;
  }
  return Object.keys(out).length ? out : null;
}

function sanitizeResultsMap(v: unknown): Record<string, TestResultValue> | null {
  if (!isRecord(v)) return null;
  const out: Record<string, TestResultValue> = {};
  for (const [k, val] of Object.entries(v).slice(0, MAX_STI_ENTRIES)) {
    if (val === "negative" || val === "positive") out[k.slice(0, 40)] = val;
  }
  return Object.keys(out).length ? out : null;
}

export function parseImportPayload(raw: string): ImportResult {
  if (raw.length > MAX_QR_PAYLOAD_CHARS) {
    return { kind: "error", reason: "Payload too large" };
  }
  let json: unknown;
  try {
    json = JSON.parse(raw.trim());
  } catch {
    return { kind: "error", reason: "Not valid JSON" };
  }
  if (!isRecord(json)) {
    return { kind: "error", reason: "Not an object" };
  }
  const p = json as Partial<ImportPayload>;
  if (p.v !== 1) return { kind: "error", reason: "Unknown version" };

  if (p.type === "test_result") {
    const tp = p as Partial<TestResultPayload>;
    if (!isIsoDate(tp.date)) {
      return { kind: "error", reason: "Missing or invalid date" };
    }
    const ts = sanitizeTsMap(tp.ts);
    const results = sanitizeResultsMap(tp.results);
    if (!ts || !results) {
      return { kind: "error", reason: "Missing test fields" };
    }
    const record: TestRecord = {
      id: gid("t"),
      date: tp.date,
      fac: clip(tp.facility),
      num: clip(tp.num),
      ts,
      results,
    };
    return { kind: "test", record };
  }

  if (p.type === "contact") {
    const cp = p as Partial<ContactPayload>;
    if (!isToken(cp.token)) {
      return { kind: "error", reason: "Missing or invalid contact token" };
    }
    const platform = PLATFORMS.find((x) => x === cp.platform);
    const handle = clip(cp.handle);
    const record: Contact = {
      id: gid("c"),
      name: clip(cp.name) || "Scanned contact",
      notes: null,
      token: cp.token,
      cx: platform && handle ? { [platform]: handle } : {},
    };
    return { kind: "contact", record };
  }

  return { kind: "error", reason: "Unknown type" };
}

// ─── Full backup import ───────────────────────────────────────────────

export interface BackupData {
  contacts?: Contact[];
  intercourse?: Intercourse[];
  tests?: TestRecord[];
  vaccinations?: Vaccination[];
  profile?: Profile;
}

export type BackupResult =
  | { kind: "backup"; data: BackupData; dropped: number }
  | { kind: "error"; reason: string };

function sanitizeActFlags(v: unknown): ActFlags {
  const out = emptyActs();
  if (isRecord(v)) {
    for (const k of ACT_KEYS) if (v[k] === 1) out[k] = 1;
  }
  return out;
}

const takeId = (v: Record<string, unknown>, prefix: string): string =>
  typeof v.id === "string" && v.id.length <= 64 ? v.id : gid(prefix);

function sanitizeList<T>(
  v: unknown,
  map: (row: Record<string, unknown>) => T | null,
): { rows: T[]; dropped: number } | null {
  if (!Array.isArray(v)) return null;
  const rows: T[] = [];
  let dropped = 0;
  for (const item of v) {
    const mapped = isRecord(item) ? map(item) : null;
    if (mapped) rows.push(mapped);
    else dropped++;
  }
  return { rows, dropped };
}

/**
 * Parse a full backup file. Collections are validated row by row;
 * malformed rows are dropped (and counted) instead of failing the whole
 * import or, worse, being accepted unchecked.
 */
export function parseBackupPayload(raw: string): BackupResult {
  if (raw.length > MAX_BACKUP_CHARS) {
    return { kind: "error", reason: "File too large" };
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { kind: "error", reason: "Not valid JSON" };
  }
  if (!isRecord(json)) return { kind: "error", reason: "Not an object" };

  let dropped = 0;
  const data: BackupData = {};

  const contacts = sanitizeList<Contact>(json.contacts, (r) => {
    if (!isToken(r.token) || typeof r.name !== "string") return null;
    const cx: Contact["cx"] = {};
    if (isRecord(r.cx)) {
      for (const pl of PLATFORMS) {
        if (typeof r.cx[pl] === "string") cx[pl] = clip(r.cx[pl]);
      }
    }
    return {
      id: takeId(r, "c"),
      name: clip(r.name),
      notes: typeof r.notes === "string" ? clip(r.notes) : null,
      token: r.token,
      cx,
    };
  });
  if (contacts) {
    data.contacts = contacts.rows;
    dropped += contacts.dropped;
  }

  const intercourse = sanitizeList<Intercourse>(json.intercourse, (r) => {
    if (!isIsoDate(r.date)) return null;
    return {
      id: takeId(r, "i"),
      date: r.date,
      cid: typeof r.cid === "string" ? r.cid.slice(0, 64) : null,
      t: sanitizeActFlags(r.t),
      p: sanitizeActFlags(r.p),
    };
  });
  if (intercourse) {
    data.intercourse = intercourse.rows;
    dropped += intercourse.dropped;
  }

  const tests = sanitizeList<TestRecord>(json.tests, (r) => {
    if (!isIsoDate(r.date)) return null;
    const ts = sanitizeTsMap(r.ts);
    if (!ts) return null;
    return {
      id: takeId(r, "t"),
      date: r.date,
      num: clip(r.num),
      fac: clip(r.fac),
      ts,
      results: sanitizeResultsMap(r.results) ?? undefined,
    };
  });
  if (tests) {
    data.tests = tests.rows;
    dropped += tests.dropped;
  }

  const vaccinations = sanitizeList<Vaccination>(json.vaccinations, (r) => {
    if (r.kind !== "vaccine" && r.kind !== "prep" && r.kind !== "doxypep") {
      return null;
    }
    return {
      id: takeId(r, "v"),
      kind: r.kind,
      type: typeof r.type === "string" ? clip(r.type) : undefined,
      manufacturer:
        typeof r.manufacturer === "string" ? clip(r.manufacturer) : undefined,
      date: isIsoDate(r.date) ? r.date : undefined,
      dose: typeof r.dose === "number" ? r.dose : undefined,
      startDate: isIsoDate(r.startDate) ? r.startDate : undefined,
      endDate: isIsoDate(r.endDate) ? r.endDate : null,
    };
  });
  if (vaccinations) {
    data.vaccinations = vaccinations.rows;
    dropped += vaccinations.dropped;
  }

  if (isRecord(json.profile)) {
    const pr = json.profile;
    data.profile = {
      age: clip(pr.age),
      pa: pr.pa === "penis" || pr.pa === "vagina" || pr.pa === "both" ? pr.pa : "both",
      conditions: Array.isArray(pr.conditions)
        ? pr.conditions.filter((c): c is string => typeof c === "string").map((c) => c.slice(0, 40))
        : [],
    };
  }

  if (!data.contacts && !data.intercourse && !data.tests && !data.vaccinations) {
    return { kind: "error", reason: "No recognizable backup collections" };
  }
  return { kind: "backup", data, dropped };
}
