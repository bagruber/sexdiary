/**
 * Signed test results: format, trust list, and the decision whether to
 * accept one. Implements `architecture/interfaces/signed-results.md`.
 *
 * The signature check itself is *injected*, not implemented here. Core
 * carries no runtime dependencies (ADR-0002), and Ed25519 is not
 * something to hand-roll. What lives here is everything that decides
 * the outcome — parsing, the trust list, revocation, the validity
 * window, and the ordering of those checks — because that is the part
 * an auditor has to be able to read and a test has to be able to pin.
 *
 * Wire format, deliberately JWS-shaped:
 *
 *     SXD1.<base64url(payload JSON)>.<base64url(signature)>
 *
 * The signature covers the *encoded* payload segment, byte for byte.
 * That removes canonicalisation from the verifying side entirely: there
 * is exactly one byte sequence to check, and it is the one that was
 * transmitted. Only the issuer needs a canonical serialisation, and a
 * mistake there produces a signature that fails loudly rather than a
 * result that verifies against different bytes than it displays.
 */
import type { ResultProvenance, TestRecord, TestResultValue } from "./domain.js";

export const RESULT_PREFIX = "SXD1";

export interface SignedPayload {
  /** Issuer key id; matches a trust-list entry. */
  iss: string;
  /** Issue date, ISO 8601 date. */
  iat: string;
  /** Sample date — this is what the diagnostic window is counted from. */
  smp: string;
  /** Analyte to finding. */
  res: Record<string, TestResultValue>;
  /** Random, so two identical findings do not produce the same QR. */
  nce: string;
}

export interface TrustEntry {
  kid: string;
  /** Shown to the user. The whole point of A6 is that this is visible. */
  name: string;
  /** Ed25519 public key, base64url. */
  key: string;
  from: string;
  until: string;
}

export interface TrustList {
  version: number;
  issuers: TrustEntry[];
  /** Key ids that must no longer be accepted. Kept apart from the
   *  issuer list so it can be updated far more often. */
  revoked: string[];
}

/**
 * Why a result was not accepted. The app tells the user which of these
 * it was: a blanket refusal makes people think the app is broken, and
 * tells the test centre nothing about what to fix.
 */
export type RejectionReason =
  | "malformed"
  | "unknown_issuer"
  | "revoked"
  | "outside_validity"
  | "bad_signature";

export type VerifiedResult =
  | {
      ok: true;
      payload: SignedPayload;
      issuer: TrustEntry;
      /** base64url, kept so the record can stay checkable. */
      signature: string;
    }
  | { ok: false; reason: RejectionReason };

/**
 * Checks `signature` over `message` with `publicKey`. Both the key and
 * the signature arrive base64url-encoded, the message as ASCII.
 */
export type VerifySignature = (
  message: string,
  signature: string,
  publicKey: string,
) => boolean;

// ─── base64url ────────────────────────────────────────────────────────
// Hand-rolled because core may not depend on anything and may not reach
// for host globals: `btoa` is absent from some React Native runtimes and
// `Buffer` is Node-only.

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function base64urlEncode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] as number;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += ALPHABET[a >> 2];
    out += ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)];
    if (b === undefined) break;
    out += ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)];
    if (c === undefined) break;
    out += ALPHABET[c & 63];
  }
  return out;
}

export function base64urlDecode(text: string): Uint8Array | null {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of text) {
    const value = ALPHABET.indexOf(ch);
    if (value < 0) return null;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  // Left-over bits must be padding zeroes; anything else is corruption.
  if (bits >= 6 || (buffer & ((1 << bits) - 1)) !== 0) return null;
  return new Uint8Array(bytes);
}

const utf8Encode = (s: string): Uint8Array => {
  const out: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) as number;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000)
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 63),
        0x80 | ((cp >> 6) & 63),
        0x80 | (cp & 63),
      );
  }
  return new Uint8Array(out);
};

const utf8Decode = (bytes: Uint8Array): string => {
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i] as number;
    let cp: number;
    let len: number;
    if (b < 0x80) [cp, len] = [b, 1];
    else if (b >> 5 === 0b110) [cp, len] = [b & 31, 2];
    else if (b >> 4 === 0b1110) [cp, len] = [b & 15, 3];
    else [cp, len] = [b & 7, 4];
    for (let j = 1; j < len; j++) cp = (cp << 6) | ((bytes[i + j] as number) & 63);
    out += String.fromCodePoint(cp);
    i += len;
  }
  return out;
};

// ─── Format ───────────────────────────────────────────────────────────

/**
 * The exact bytes an issuer signs. Key order is fixed and analytes are
 * sorted, so the same finding always produces the same message.
 */
export function payloadSegment(payload: SignedPayload): string {
  const res: Record<string, TestResultValue> = {};
  for (const analyte of Object.keys(payload.res).sort()) {
    res[analyte] = payload.res[analyte] as TestResultValue;
  }
  const canonical = JSON.stringify({
    iss: payload.iss,
    iat: payload.iat,
    smp: payload.smp,
    res,
    nce: payload.nce,
  });
  return base64urlEncode(utf8Encode(canonical));
}

/** Assembles the QR text. Used by an issuer, and by the tests. */
export function encodeSignedResult(
  payload: SignedPayload,
  signature: Uint8Array,
): string {
  return `${RESULT_PREFIX}.${payloadSegment(payload)}.${base64urlEncode(signature)}`;
}

function parsePayload(segment: string): SignedPayload | null {
  const bytes = base64urlDecode(segment);
  if (!bytes) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(utf8Decode(bytes));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const p = parsed as Record<string, unknown>;
  const strings = ["iss", "iat", "smp", "nce"] as const;
  if (strings.some((k) => typeof p[k] !== "string")) return null;
  if (typeof p.res !== "object" || p.res === null || Array.isArray(p.res)) {
    return null;
  }
  const res: Record<string, TestResultValue> = {};
  for (const [analyte, value] of Object.entries(p.res)) {
    if (value !== "negative" && value !== "positive") return null;
    res[analyte] = value;
  }
  if (!Object.keys(res).length) return null;
  return {
    iss: p.iss as string,
    iat: p.iat as string,
    smp: p.smp as string,
    res,
    nce: p.nce as string,
  };
}

/**
 * Accept or reject a scanned result. Entirely offline: nothing here
 * reaches the network, because a lookup at scan time would tell the
 * operator when someone imports a finding (A2, ADR-0003).
 *
 * A key that has expired since the sample was taken still verifies the
 * findings it signed while it was valid — otherwise every stored result
 * would turn invalid on a routine key rotation.
 */
export function verifySignedResult(
  qr: string,
  trust: TrustList,
  verify: VerifySignature,
): VerifiedResult {
  const parts = qr.split(".");
  if (parts.length !== 3 || parts[0] !== RESULT_PREFIX) {
    return { ok: false, reason: "malformed" };
  }
  const [, segment, signature] = parts as [string, string, string];
  const payload = parsePayload(segment);
  if (!payload || !base64urlDecode(signature)) {
    return { ok: false, reason: "malformed" };
  }

  const issuer = trust.issuers.find((i) => i.kid === payload.iss);
  if (!issuer) return { ok: false, reason: "unknown_issuer" };
  if (trust.revoked.includes(issuer.kid)) {
    return { ok: false, reason: "revoked" };
  }
  if (payload.smp < issuer.from || payload.smp > issuer.until) {
    return { ok: false, reason: "outside_validity" };
  }
  if (!verify(segment, signature, issuer.key)) {
    return { ok: false, reason: "bad_signature" };
  }
  return { ok: true, payload, issuer, signature };
}

/**
 * Turn a verified result into a record for the diary.
 *
 * The sample date becomes the record's date, not the issue date: the
 * diagnostic window is counted from when the sample was taken, and
 * using the issue date would silently move every window.
 */
export function recordFromVerified(
  verified: Extract<VerifiedResult, { ok: true }>,
  id: string,
  importedAt: string,
): TestRecord {
  const ts: Partial<Record<string, 0 | 1>> = {};
  for (const analyte of Object.keys(verified.payload.res)) ts[analyte] = 1;
  const signed: ResultProvenance = {
    kid: verified.issuer.kid,
    issuer: verified.issuer.name,
    qr: encodeSignedResultFrom(verified),
    importedAt,
  };
  return {
    id,
    date: verified.payload.smp,
    num: verified.payload.nce,
    fac: verified.issuer.name,
    ts,
    results: { ...verified.payload.res },
    signed,
  };
}

/** Rebuilds the QR text a verified result came from. */
function encodeSignedResultFrom(
  verified: Extract<VerifiedResult, { ok: true }>,
): string {
  return `${RESULT_PREFIX}.${payloadSegment(verified.payload)}.${verified.signature}`;
}
