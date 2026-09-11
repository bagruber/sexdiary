/**
 * Encrypted backup files (ADR-0009, the file-export leg).
 *
 * The container is defined in core; everything cryptographic is here,
 * because core carries no dependencies. Two layers:
 *
 *   1. A 256-bit key derived from the passphrase with scrypt over a
 *      fresh 128-bit salt. Memory-hard, so an offline guesser cannot
 *      simply throw GPUs at it. Parameters travel inside the file, so
 *      raising the cost later leaves old files readable.
 *   2. AES-256-GCM under a fresh 96-bit nonce — the same cipher the app
 *      already uses at rest, rather than a second scheme to review.
 *
 * There is no key escrow and no recovery path. A lost passphrase is a
 * lost backup; ADR-0009 requires that be said plainly before setup, not
 * discovered afterwards.
 */
import { gcm } from "@noble/ciphers/aes.js";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils.js";
import { scrypt } from "@noble/hashes/scrypt.js";
import * as ExpoCrypto from "expo-crypto";
import {
  SCRYPT_DEFAULTS,
  decodeAppData,
  encodeAppData,
  makeBackup,
  parseBackup,
  serializeBackup,
  type AppData,
  type Lang,
  type ScryptParams,
} from "@sexdiary/core";

const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const KEY_BYTES = 32;

function deriveKey(passphrase: string, kdf: Omit<ScryptParams, "name">) {
  return scrypt(utf8ToBytes(passphrase.normalize("NFKC")), hexToBytes(kdf.salt), {
    N: kdf.N,
    r: kdf.r,
    p: kdf.p,
    dkLen: KEY_BYTES,
  });
}

export function createBackup(data: AppData, passphrase: string): string {
  const salt = bytesToHex(ExpoCrypto.getRandomValues(new Uint8Array(SALT_BYTES)));
  const nonce = ExpoCrypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const key = deriveKey(passphrase, { ...SCRYPT_DEFAULTS, salt });
  const ciphertext = gcm(key, nonce).encrypt(utf8ToBytes(encodeAppData(data)));
  return serializeBackup(
    makeBackup({ salt, nonce: bytesToHex(nonce), data: bytesToHex(ciphertext) }),
  );
}

/**
 * A wrong passphrase and a damaged file both fail here, and GCM cannot
 * tell them apart — authentication simply does not verify. The message
 * says both, because guessing on the reader's behalf would be worse.
 */
export function restoreBackup(raw: string, passphrase: string, lang: Lang): AppData {
  const file = parseBackup(raw);
  const key = deriveKey(passphrase, file.kdf);
  let plaintext: string;
  try {
    plaintext = bytesToUtf8(
      gcm(key, hexToBytes(file.nonce)).decrypt(hexToBytes(file.data)),
    );
  } catch {
    throw new Error("wrongPassphraseOrDamaged");
  }
  return decodeAppData(plaintext, lang);
}
