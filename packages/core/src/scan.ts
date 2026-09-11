/**
 * Was passiert, wenn jemand einen Code einliest.
 *
 * Bis heute ging jeder Scan durch `parseImportPayload`. Das versteht
 * Kontakt-Codes und Testergebnisse als JSON — und nimmt letztere
 * ungeprueft an. Das signierte Format aus
 * `architecture/interfaces/signed-results.md` hatte gar keinen Leser:
 * `verifySignedResult` liegt im Kern, ist getestet, und **keine App rief
 * es auf**. [ADR-0007](../../../architecture/adr/0007-signierte-testergebnisse.md)
 * galt damit nur auf dem Papier.
 *
 * Diese Datei ist die Weiche. Sie liegt im Kern und nicht im
 * Bildschirm, weil sie entscheidet, welche Herkunft ein Datensatz
 * bekommt — und das ist die Aussage, um die es bei signierten Befunden
 * ueberhaupt geht. Eine Weiche in einer `.tsx` unter einem
 * Kamera-Callback liest kein Auditor.
 *
 * Der Kern selbst kann kein Ed25519 (ADR-0002, null Runtime-
 * Abhaengigkeiten). Die Pruefung wird hereingereicht.
 */
import type { Contact, TestRecord } from "./domain.js";
import { gid } from "./id.js";
import { parseImportPayload } from "./schema.js";
import {
  RESULT_PREFIX,
  draftFromPayload,
  parseSignedPayload,
  recordFromVerified,
  verifySignedResult,
  type RejectionReason,
  type TrustList,
  type VerifySignature,
} from "./signed-result.js";

export type ScanOutcome =
  /** Kontakt-Token, wie eh und je. */
  | { kind: "contact"; record: Contact }
  /** Testergebnis im offenen JSON-Format — niemand buergt dafuer. */
  | { kind: "test"; record: TestRecord }
  /** Signiert, geprueft, angenommen. Traegt die Herkunft. */
  | { kind: "signed"; record: TestRecord; issuer: string }
  /**
   * Signiert, aber nicht angenommen. `draft` ist gesetzt, wenn die
   * Nutzlast wenigstens lesbar war — dann darf der Nutzer sie
   * ausdruecklich als selbst eingetragen uebernehmen.
   */
  | { kind: "rejected"; reason: RejectionReason; draft: TestRecord | null }
  | { kind: "error"; reason: string };

/** Ist das ueberhaupt ein signierter Befund? */
export function isSignedResult(raw: string): boolean {
  return raw.trimStart().startsWith(`${RESULT_PREFIX}.`);
}

export function readScannedCode(
  raw: string,
  ctx: {
    trust: TrustList;
    verify: VerifySignature;
    /** Zeitpunkt des Imports, ISO 8601. */
    now: string;
  },
): ScanOutcome {
  const text = raw.trim();

  if (isSignedResult(text)) {
    const verified = verifySignedResult(text, ctx.trust, ctx.verify);
    if (verified.ok) {
      return {
        kind: "signed",
        record: recordFromVerified(verified, gid(), ctx.now),
        issuer: verified.issuer.name,
      };
    }
    // Abgelehnt. Die Nutzlast wird trotzdem gelesen, damit der Weg aus
    // der Spezifikation offensteht — sie ist dann eine Behauptung des
    // Codes, kein Befund, und der Entwurf traegt kein `signed`.
    const payload = parseSignedPayload(text);
    return {
      kind: "rejected",
      reason: verified.reason,
      draft: payload ? draftFromPayload(payload, gid()) : null,
    };
  }

  const r = parseImportPayload(text);
  if (r.kind === "test") return { kind: "test", record: r.record };
  if (r.kind === "contact") return { kind: "contact", record: r.record };
  return { kind: "error", reason: r.reason };
}
