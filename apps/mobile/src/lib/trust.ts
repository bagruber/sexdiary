/**
 * Die Vertrauensliste und die Signaturpruefung — die beiden Dinge, die
 * der Kern nicht selbst mitbringen darf.
 *
 * Der Kern traegt null Runtime-Abhaengigkeiten (ADR-0002), und Ed25519
 * schreibt man nicht selbst. Deshalb entscheidet `readScannedCode` im
 * Kern, *was* gilt, und diese Datei liefert das Werkzeug dafuer.
 */
import { ed25519 } from "@noble/curves/ed25519.js";
import { base64urlDecode, type TrustList, type VerifySignature } from "@sexdiary/core";

/**
 * Die Liste wird mit der App ausgeliefert, damit die erste Pruefung
 * ohne Netz funktioniert (`architecture/interfaces/signed-results.md`).
 *
 * **Sie ist leer, und das ist der Ist-Zustand, keine Auslassung.** Es
 * nimmt bisher keine Teststelle teil; es gibt keinen oeffentlichen
 * Schluessel, den einzutragen ehrlich waere. Ein erfundener
 * Demo-Aussteller waere schlimmer als eine leere Liste: er wuerde
 * genau die Zusicherung vortaeuschen, um die es hier geht.
 *
 * Die Folge ist gewollt und gepruefte Logik: jeder signierte Code wird
 * heute mit `unknown_issuer` abgelehnt, und der Nutzer bekommt den Weg
 * angeboten, ihn als selbst eingetragenen Datensatz zu behalten. Sobald
 * ein Gesundheitsamt einen Schluessel veroeffentlicht, ist das hier ein
 * Eintrag und sonst nichts.
 */
export const TRUST_LIST: TrustList = {
  version: 1,
  issuers: [],
  revoked: [],
};

/**
 * Ed25519 aus `@noble/curves` — dieselbe Familie wie die bereits
 * eingesetzten `@noble/ciphers` und `@noble/hashes`, reines
 * TypeScript, kein natives Modul.
 *
 * Wirft nie. Ein kaputter Schluessel oder eine kaputte Signatur ist
 * eine Ablehnung, kein Absturz: die Eingabe kommt von einem fremden
 * QR-Code, und der darf die App nicht anhalten koennen.
 */
export const verifySignature: VerifySignature = (message, signature, key) => {
  try {
    const sig = base64urlDecode(signature);
    const pub = base64urlDecode(key);
    if (!sig || !pub || sig.length !== 64 || pub.length !== 32) return false;
    const bytes = new Uint8Array(message.length);
    for (let i = 0; i < message.length; i++) bytes[i] = message.charCodeAt(i);
    return ed25519.verify(sig, bytes, pub);
  } catch {
    return false;
  }
};
