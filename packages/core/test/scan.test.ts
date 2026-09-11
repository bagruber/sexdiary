import {
  createPublicKey,
  generateKeyPairSync,
  sign,
  verify,
} from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  base64urlDecode,
  base64urlEncode,
  encodeSignedResult,
  payloadSegment,
  readScannedCode,
  type SignedPayload,
  type TrustEntry,
  type TrustList,
  type VerifySignature,
} from "../src";

/**
 * Echtes Ed25519 aus Node, wie in `signed-result.test.ts`. Ein Stub
 * bewiese nur, dass der Stub gerufen wurde — hier geht es gerade darum,
 * dass die Weiche eine *echte* Signatur von einer gefaelschten
 * unterscheidet.
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

const ctx = (over: Partial<Parameters<typeof readScannedCode>[1]> = {}) => ({
  trust: trust(),
  verify: ed25519,
  now: "2026-09-10T12:00:00.000Z",
  ...over,
});

describe("readScannedCode", () => {
  describe("signierter Befund", () => {
    it("nimmt eine gueltige Signatur an und traegt die Herkunft ein", () => {
      const out = readScannedCode(qrFor(), ctx());
      expect(out.kind).toBe("signed");
      if (out.kind !== "signed") return;

      expect(out.issuer).toBe(ISSUER.name);
      expect(out.record.signed?.kid).toBe(ISSUER.kid);
      expect(out.record.signed?.issuer).toBe(ISSUER.name);
      expect(out.record.signed?.importedAt).toBe("2026-09-10T12:00:00.000Z");
      // Das Probendatum, nicht das Ausstellungsdatum: das
      // diagnostische Fenster zaehlt ab der Probe.
      expect(out.record.date).toBe("2026-08-20");
      expect(out.record.results).toEqual(payload.res);
    });

    it("bewahrt den QR-Text, damit die Signatur spaeter pruefbar bleibt", () => {
      const qr = qrFor();
      const out = readScannedCode(qr, ctx());
      expect(out.kind === "signed" && out.record.signed?.qr).toBe(qr);
    });

    /**
     * Der Kern der Sache. Vor dieser Aenderung war ein eingelesener
     * Befund nicht mehr wert als ein getippter — hier faellt auf, wenn
     * er das wieder wird.
     */
    it("lehnt eine gefaelschte Signatur ab", () => {
      const echt = qrFor();
      const [prefix, segment] = echt.split(".") as [string, string];
      const gefaelscht = `${prefix}.${segment}.${b64u(new Uint8Array(64))}`;

      const out = readScannedCode(gefaelscht, ctx());
      expect(out.kind).toBe("rejected");
      expect(out.kind === "rejected" && out.reason).toBe("bad_signature");
    });

    /**
     * Der Angriff, um den es wirklich geht: nicht eine erfundene
     * Signatur, sondern eine echte ueber veraenderten Inhalt. Jemand
     * bekommt einen positiven Befund und schreibt „negative" hinein,
     * bevor er ihn weiterreicht.
     */
    it("lehnt eine echte Signatur ueber veraenderter Nutzlast ab", () => {
      const [prefix, segment, signatur] = qrFor().split(".") as [
        string,
        string,
        string,
      ];

      // Nutzlast entpacken, Befund umschreiben, wieder einpacken.
      const klartext = Buffer.from(
        base64urlDecode(segment) as Uint8Array,
      ).toString("utf8");
      expect(klartext).toContain('"Gonorrhea":"positive"');
      const manipuliert = b64u(
        Buffer.from(
          klartext.replace('"Gonorrhea":"positive"', '"Gonorrhea":"negative"'),
          "utf8",
        ),
      );
      expect(manipuliert).not.toBe(segment);

      const out = readScannedCode(
        `${prefix}.${manipuliert}.${signatur}`,
        ctx(),
      );
      expect(out.kind).toBe("rejected");
      expect(out.kind === "rejected" && out.reason).toBe("bad_signature");
    });

    it("lehnt einen unbekannten Aussteller ab — der Normalfall heute", () => {
      const out = readScannedCode(
        qrFor(),
        ctx({ trust: trust({ issuers: [] }) }),
      );
      expect(out.kind === "rejected" && out.reason).toBe("unknown_issuer");
    });

    it("lehnt einen gesperrten Schluessel ab", () => {
      const out = readScannedCode(
        qrFor(),
        ctx({ trust: trust({ revoked: [ISSUER.kid] }) }),
      );
      expect(out.kind === "rejected" && out.reason).toBe("revoked");
    });
  });

  describe("was nach einer Ablehnung uebrig bleibt", () => {
    /**
     * Die Spezifikation verlangt, dass ein abgelehnter Code auf
     * ausdrueckliche Wahl als selbst eingetragener Datensatz uebernommen
     * werden darf. Sonst waere die App bei einer nicht teilnehmenden
     * Teststelle schlechter als ganz ohne die Funktion — und heute
     * nimmt keine einzige teil.
     */
    it("gibt einen Entwurf heraus, wenn die Nutzlast lesbar war", () => {
      const out = readScannedCode(
        qrFor(),
        ctx({ trust: trust({ issuers: [] }) }),
      );
      expect(out.kind === "rejected" && out.draft).not.toBeNull();
      if (out.kind !== "rejected" || !out.draft) return;

      expect(out.draft.date).toBe("2026-08-20");
      expect(out.draft.results).toEqual(payload.res);
    });

    it("markiert diesen Entwurf NICHT als signiert", () => {
      const out = readScannedCode(
        qrFor(),
        ctx({ trust: trust({ issuers: [] }) }),
      );
      expect(out.kind === "rejected" && out.draft?.signed).toBeUndefined();
    });

    it("nennt keine Einrichtung — sie hat nichts bestaetigt", () => {
      const out = readScannedCode(
        qrFor(),
        ctx({ trust: trust({ issuers: [] }) }),
      );
      expect(out.kind === "rejected" && out.draft?.fac).toBe("");
    });

    it("hat keinen Entwurf, wenn die Nutzlast Unsinn ist", () => {
      const out = readScannedCode("SXD1.@@@.@@@", ctx());
      expect(out.kind).toBe("rejected");
      expect(out.kind === "rejected" && out.reason).toBe("malformed");
      expect(out.kind === "rejected" && out.draft).toBeNull();
    });
  });

  describe("die uebrigen Codes gehen weiter wie bisher", () => {
    it("liest ein Kontakt-Token", () => {
      const raw = JSON.stringify({
        v: 1,
        type: "contact",
        token: "a3f19c72b8d40e51",
      });
      const out = readScannedCode(raw, ctx());
      expect(out.kind).toBe("contact");
      expect(out.kind === "contact" && out.record.token).toBe(
        "a3f19c72b8d40e51",
      );
    });

    it("liest ein offenes Testergebnis — und es bleibt ohne Herkunft", () => {
      const raw = JSON.stringify({
        v: 1,
        type: "test_result",
        date: "2026-08-20",
        facility: "Praxis Mitte",
        num: "L-4471",
        ts: { HIV: 1 },
        results: { HIV: "negative" },
      });
      const out = readScannedCode(raw, ctx());
      expect(out.kind).toBe("test");
      expect(out.kind === "test" && out.record.signed).toBeUndefined();
    });

    it("meldet einen Fehler bei allem anderen", () => {
      expect(readScannedCode("Guten Tag", ctx()).kind).toBe("error");
    });
  });

  it("erkennt das signierte Format auch mit Leerraum davor", () => {
    const out = readScannedCode(`\n  ${qrFor()}  `, ctx());
    expect(out.kind).toBe("signed");
  });
});
