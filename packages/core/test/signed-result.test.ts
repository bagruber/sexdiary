import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  base64urlDecode,
  base64urlEncode,
  encodeSignedResult,
  payloadSegment,
  recordFromVerified,
  verifySignedResult,
  type SignedPayload,
  type TrustEntry,
  type TrustList,
  type VerifySignature,
} from "../src/signed-result";

/**
 * Real Ed25519, from Node's own crypto. Core injects the verifier
 * rather than carrying one, and a stub would only prove that the stub
 * was called — this proves the format survives an actual signature.
 */
const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const rawPublic = publicKey.export({ format: "der", type: "spki" }).subarray(-32);

const b64u = (b: Buffer | Uint8Array) => base64urlEncode(new Uint8Array(b));

const signSegment = (segment: string): Uint8Array =>
  new Uint8Array(sign(null, Buffer.from(segment, "ascii"), privateKey));

const ed25519: VerifySignature = (message, signature, key) => {
  const sig = base64urlDecode(signature);
  const pub = base64urlDecode(key);
  if (!sig || !pub) return false;
  const spki = createPublicKey({
    key: Buffer.concat([
      Buffer.from("302a300506032b6570032100", "hex"),
      Buffer.from(pub),
    ]),
    format: "der",
    type: "spki",
  });
  return verify(null, Buffer.from(message, "ascii"), spki, Buffer.from(sig));
};

const ISSUER: TrustEntry = {
  kid: "muc-gsa-01",
  name: "Gesundheitsamt München, Teststelle Schwanthalerhöhe",
  key: b64u(rawPublic),
  from: "2026-01-01",
  until: "2026-12-31",
};

const trust = (over: Partial<TrustList> = {}): TrustList => ({
  version: 1,
  issuers: [ISSUER],
  revoked: [],
  ...over,
});

const payload: SignedPayload = {
  iss: ISSUER.kid,
  iat: "2026-08-27",
  smp: "2026-08-20",
  res: { HIV: "negative", Syphilis: "negative", Gonorrhea: "positive" },
  nce: "9f3c1a70",
};

const qrFor = (p: SignedPayload = payload) =>
  encodeSignedResult(p, signSegment(payloadSegment(p)));

describe("base64url", () => {
  it("round-trips every remainder length", () => {
    for (let n = 0; n <= 8; n++) {
      const bytes = new Uint8Array(
        Array.from({ length: n }, (_, i) => (i * 37 + 251) & 0xff),
      );
      expect(base64urlDecode(base64urlEncode(bytes))).toEqual(bytes);
    }
  });

  it("uses the url alphabet, and no padding", () => {
    const encoded = base64urlEncode(new Uint8Array([251, 255, 190, 255]));
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("refuses characters outside the alphabet", () => {
    expect(base64urlDecode("abc!")).toBeNull();
    expect(base64urlDecode("ab=")).toBeNull();
  });

  it("refuses a truncated group", () => {
    // A single leftover character carries 6 bits — not enough for a byte
    // and not a valid encoding of anything.
    expect(base64urlDecode("A")).toBeNull();
  });
});

describe("payload encoding", () => {
  it("does not depend on the order the analytes were written in", () => {
    const reordered: SignedPayload = {
      ...payload,
      res: { Gonorrhea: "positive", HIV: "negative", Syphilis: "negative" },
    };
    expect(payloadSegment(reordered)).toBe(payloadSegment(payload));
  });

  it("survives non-ASCII in the payload", () => {
    const p: SignedPayload = { ...payload, iss: "münchen-süd-01" };
    const result = verifySignedResult(
      qrFor(p),
      trust({ issuers: [{ ...ISSUER, kid: "münchen-süd-01" }] }),
      ed25519,
    );
    expect(result.ok).toBe(true);
  });

  it("stays small enough for a receipt", () => {
    // A5 in the interface spec. Roughly QR version 13 at error level M.
    expect(qrFor().length).toBeLessThan(400);
  });
});

describe("verifySignedResult", () => {
  it("accepts a genuine result and names the issuer", () => {
    const result = verifySignedResult(qrFor(), trust(), ed25519);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.issuer.name).toBe(ISSUER.name);
    expect(result.payload.res.Gonorrhea).toBe("positive");
    expect(result.payload.smp).toBe("2026-08-20");
  });

  it("rejects a changed finding", () => {
    // The whole point: turn the positive into a negative and the
    // signature no longer covers what the QR says.
    const forged: SignedPayload = {
      ...payload,
      res: { ...payload.res, Gonorrhea: "negative" },
    };
    const qr = `SXD1.${payloadSegment(forged)}.${qrFor().split(".")[2]}`;
    expect(verifySignedResult(qr, trust(), ed25519)).toEqual({
      ok: false,
      reason: "bad_signature",
    });
  });

  it("rejects a signature from another key", () => {
    const other = generateKeyPairSync("ed25519");
    const segment = payloadSegment(payload);
    const qr = `SXD1.${segment}.${b64u(
      sign(null, Buffer.from(segment, "ascii"), createPrivateKey(other.privateKey.export({ format: "pem", type: "pkcs8" }))),
    )}`;
    expect(verifySignedResult(qr, trust(), ed25519)).toEqual({
      ok: false,
      reason: "bad_signature",
    });
  });

  it("rejects an issuer it has never heard of", () => {
    expect(
      verifySignedResult(qrFor(), trust({ issuers: [] }), ed25519),
    ).toEqual({ ok: false, reason: "unknown_issuer" });
  });

  it("rejects a revoked key before it bothers with the signature", () => {
    // Reporting "revoked" is more useful to the user than "bad
    // signature", and a revoked key must not be trusted even if the
    // maths checks out.
    const result = verifySignedResult(
      qrFor(),
      trust({ revoked: [ISSUER.kid] }),
      () => true,
    );
    expect(result).toEqual({ ok: false, reason: "revoked" });
  });

  it("rejects a sample taken outside the key's validity", () => {
    const result = verifySignedResult(
      qrFor(),
      trust({ issuers: [{ ...ISSUER, from: "2026-09-01" }] }),
      ed25519,
    );
    expect(result).toEqual({ ok: false, reason: "outside_validity" });
  });

  it("still accepts a result signed while the key was valid", () => {
    // The open question from ADR-0007: a routine key rotation must not
    // invalidate every finding already in someone's history.
    const result = verifySignedResult(
      qrFor(),
      trust({ issuers: [{ ...ISSUER, until: "2026-08-25" }] }),
      ed25519,
    );
    expect(result.ok).toBe(true);
  });

  it.each([
    ["a foreign prefix", "OTHER.abc.def"],
    ["too few segments", "SXD1.abc"],
    ["payload that is not base64url", "SXD1.***.abc"],
    ["payload that is not JSON", `SXD1.${base64urlEncode(new Uint8Array([1, 2, 3]))}.ab`],
    ["signature that is not base64url", `SXD1.${payloadSegment(payload)}.***`],
    ["an empty string", ""],
  ])("calls %s malformed", (_name, qr) => {
    expect(verifySignedResult(qr, trust(), ed25519)).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("refuses a payload with a result value it does not know", () => {
    const bad = JSON.stringify({
      iss: ISSUER.kid,
      iat: "2026-08-27",
      smp: "2026-08-20",
      res: { HIV: "inconclusive" },
      nce: "1",
    });
    const segment = base64urlEncode(new Uint8Array(Buffer.from(bad, "utf8")));
    expect(
      verifySignedResult(`SXD1.${segment}.ab`, trust(), ed25519),
    ).toEqual({ ok: false, reason: "malformed" });
  });
});

describe("recordFromVerified", () => {
  const verified = verifySignedResult(qrFor(), trust(), ed25519);

  it("dates the record from the sample, not from the issue", () => {
    // The window is counted from when the sample was taken. Using the
    // issue date would move every window by the lab's turnaround time.
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    const record = recordFromVerified(verified, "r1", "2026-08-27");
    expect(record.date).toBe("2026-08-20");
    expect(record.date).not.toBe(verified.payload.iat);
  });

  it("carries the issuer and stays checkable later", () => {
    if (!verified.ok) return;
    const record = recordFromVerified(verified, "r1", "2026-08-27");
    expect(record.signed?.issuer).toBe(ISSUER.name);
    // The stored QR must verify again, or "signed" is just a label.
    expect(verifySignedResult(record.signed?.qr ?? "", trust(), ed25519).ok).toBe(
      true,
    );
  });

  it("marks every analyte the panel covered", () => {
    if (!verified.ok) return;
    const record = recordFromVerified(verified, "r1", "2026-08-27");
    expect(Object.keys(record.ts).sort()).toEqual([
      "Gonorrhea",
      "HIV",
      "Syphilis",
    ]);
    expect(record.results?.Gonorrhea).toBe("positive");
  });
});
