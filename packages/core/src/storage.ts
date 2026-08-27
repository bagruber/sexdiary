/**
 * Versioned storage envelope shared by all platforms.
 *
 * Core owns the serialized format: an envelope with a schema version,
 * a migration table, and defensive sanitization on read. Hosts own the
 * bytes: the web app persists to localStorage, the mobile app to an
 * encrypted file. Both call encodeAppData/decodeAppData so stored data
 * survives app-schema changes on every platform the same way.
 *
 * History:
 *   v1 — bare AppData object, no envelope (web prototype ≤ 0.3.x)
 *   v2 — envelope { v, savedAt, data }, same AppData shape
 *   v3 — prefs.lockPin dropped: the app lock is the device's own
 *        authentication now, so the app no longer keeps a PIN of its own
 */

import type { AppData, Lang } from "./domain.js";
import { freshAppData } from "./seed.js";

export const CURRENT_SCHEMA_VERSION = 3;

export interface StorageEnvelope {
  v: number;
  savedAt: string; // ISO 8601
  data: unknown;
}

export class StorageDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageDecodeError";
  }
}

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** Keyed by the version each migration upgrades FROM. */
const MIGRATIONS: Record<number, Migration> = {
  // v1 → v2: envelope introduced around an unchanged AppData shape.
  1: (data) => data,
  // v2 → v3: the app-owned PIN is gone. Anyone who had one had the lock
  // switched on, so carry that intent over to the real lock rather than
  // silently unlocking them.
  2: (data) => {
    const prefs = data.prefs;
    if (typeof prefs !== "object" || prefs === null) return data;
    const { lockPin, ...rest } = prefs as Record<string, unknown>;
    return { ...data, prefs: { ...rest, lock: lockPin != null } };
  },
};

export function encodeAppData(data: AppData): string {
  const envelope: StorageEnvelope = {
    v: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(envelope);
}

export function decodeAppData(raw: string, fallbackLang: Lang = "en"): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new StorageDecodeError("Stored data is not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new StorageDecodeError("Stored data is not an object");
  }

  const obj = parsed as Record<string, unknown>;
  let version: number;
  let data: Record<string, unknown>;
  if (typeof obj.v === "number" && "data" in obj) {
    version = obj.v;
    if (typeof obj.data !== "object" || obj.data === null) {
      throw new StorageDecodeError("Envelope has no data object");
    }
    data = obj.data as Record<string, unknown>;
  } else {
    // Legacy v1: the bare AppData object itself.
    version = 1;
    data = obj;
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new StorageDecodeError(
      `Data was written by a newer app (schema v${version}, this app reads up to v${CURRENT_SCHEMA_VERSION})`,
    );
  }
  for (let v = version; v < CURRENT_SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) throw new StorageDecodeError(`No migration path from schema v${v}`);
    data = step(data);
  }

  return sanitizeAppData(data, fallbackLang);
}

/**
 * Merge decoded data over a fresh default state, dropping values of the
 * wrong shape rather than letting them poison the store.
 */
export function sanitizeAppData(
  data: Record<string, unknown>,
  fallbackLang: Lang,
): AppData {
  const base = freshAppData(fallbackLang);
  const arr = <T>(v: unknown, fallback: T[]): T[] =>
    Array.isArray(v) ? (v as T[]) : fallback;

  const profileRaw =
    typeof data.profile === "object" && data.profile !== null
      ? (data.profile as Record<string, unknown>)
      : {};
  const prefsRaw =
    typeof data.prefs === "object" && data.prefs !== null
      ? (data.prefs as Record<string, unknown>)
      : {};

  return {
    ...base,
    contacts: arr(data.contacts, base.contacts),
    intercourse: arr(data.intercourse, base.intercourse),
    tests: arr(data.tests, base.tests),
    vaccinations: arr(data.vaccinations, base.vaccinations),
    profile: {
      ...base.profile,
      ...profileRaw,
      conditions: Array.isArray(profileRaw.conditions)
        ? (profileRaw.conditions as string[])
        : [],
    },
    prefs: { ...base.prefs, ...prefsRaw },
    myToken: typeof data.myToken === "string" ? data.myToken : base.myToken,
    onboarded: data.onboarded === true,
  } as AppData;
}
