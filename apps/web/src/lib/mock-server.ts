/**
 * Mock partner-alert server, held in memory for the life of the tab.
 *
 * A real implementation would post to a server keyed by recipient token.
 * Here the records only need to live long enough for the status to
 * advance on screen, so they live in a variable.
 *
 * It used to be localStorage, and that was wrong for a demonstration
 * build: a row pairs a recipient token with an infection name, which is
 * exactly the kind of trace this product exists to avoid leaving behind.
 * Nothing in this build outlives a reload (see AppProvider).
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

let alerts: MockAlert[] = [];

const readAll = (): MockAlert[] => alerts;

function writeAll(rows: MockAlert[]): void {
  alerts = rows;
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
