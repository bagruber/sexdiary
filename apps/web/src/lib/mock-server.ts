/**
 * Mock partner-alert server backed by localStorage.
 *
 * Real implementation would post to a server keyed by recipient token.
 * For the prototype, we store records locally and auto-advance status
 * based on elapsed wall time. Status survives reload.
 */

export type AlertStatus =
  | "pending"
  | "notified"
  | "confirmed"
  | "testedNegative";

export interface MockAlert {
  id: string;
  toToken: string;
  sti: string;
  sentAt: number; // epoch ms
  manualNote?: string;
}

const KEY = "sexdiary.v1.mockServer.alerts";

function readAll(): MockAlert[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as MockAlert[];
  } catch {
    return [];
  }
}

function writeAll(rows: MockAlert[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function sendAlert(toToken: string, sti: string): MockAlert {
  const all = readAll();
  const row: MockAlert = {
    id: `a${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    toToken,
    sti,
    sentAt: Date.now(),
  };
  all.push(row);
  writeAll(all);
  return row;
}

export function statusFor(toToken: string, sti: string): AlertStatus {
  const row = readAll().find((a) => a.toToken === toToken && a.sti === sti);
  if (!row) return "pending";
  const elapsedSec = (Date.now() - row.sentAt) / 1000;
  // simulated progression: notified → confirmed (after 8s) → testedNegative (after 25s)
  if (elapsedSec < 8) return "notified";
  if (elapsedSec < 25) return "confirmed";
  return "testedNegative";
}

export function clearAllAlerts(): void {
  writeAll([]);
}

export function exportAlerts(): MockAlert[] {
  return readAll();
}
