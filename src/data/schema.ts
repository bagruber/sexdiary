/**
 * Schemas for QR-importable payloads. These define what external test
 * providers or contact-exchange QRs should contain.
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
 *     "token": "hex string",
 *     "platform": "instagram" | "telegram" | ... (optional),
 *     "handle": "@name" (optional)
 *   }
 *
 * Full data backup payload (JSON paste only, not QR — too large):
 *   { contacts, intercourse, tests, vaccinations, profile }
 */

import type {
  Contact,
  ContactHandlePlatform,
  TestRecord,
  TestResultValue,
} from "../types/domain";
import { gid } from "../lib/id";

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

export function parseImportPayload(raw: string): ImportResult {
  let json: unknown;
  try {
    json = JSON.parse(raw.trim());
  } catch {
    return { kind: "error", reason: "Not valid JSON" };
  }
  if (typeof json !== "object" || json === null) {
    return { kind: "error", reason: "Not an object" };
  }
  const p = json as Partial<ImportPayload>;
  if (p.v !== 1) return { kind: "error", reason: "Unknown version" };

  if (p.type === "test_result") {
    const tp = p as Partial<TestResultPayload>;
    if (!tp.date || !tp.ts || !tp.results) {
      return { kind: "error", reason: "Missing test fields" };
    }
    const record: TestRecord = {
      id: gid("t"),
      date: tp.date,
      fac: tp.facility ?? "",
      num: tp.num ?? "",
      ts: tp.ts,
      results: tp.results,
    };
    return { kind: "test", record };
  }

  if (p.type === "contact") {
    const cp = p as Partial<ContactPayload>;
    if (!cp.token) return { kind: "error", reason: "Missing contact token" };
    const record: Contact = {
      id: gid("c"),
      name: cp.name ?? "Scanned contact",
      notes: null,
      token: cp.token,
      cx: cp.platform && cp.handle ? { [cp.platform]: cp.handle } : {},
    };
    return { kind: "contact", record };
  }

  return { kind: "error", reason: "Unknown type" };
}
