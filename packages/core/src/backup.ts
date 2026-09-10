/**
 * What a backup file looks like.
 *
 * No cryptography happens here. This package carries no dependencies —
 * it is the audit surface — so the key derivation and the cipher live in
 * the app. This module only agrees on the container and refuses to parse
 * anything it does not recognise.
 *
 * The header is deliberately self-describing rather than compact. Every
 * file states which parameters it was written with, which buys two
 * things: the cost can be raised later without orphaning old files, and
 * someone holding a file in three years without the app can still tell
 * what to do with the bytes.
 */
import { CURRENT_SCHEMA_VERSION } from "./storage.js";

export const BACKUP_FORMAT = "sexdiary.backup";
export const BACKUP_FORMAT_VERSION = 1;

export interface ScryptParams {
  name: "scrypt";
  /**
   * CPU/memory cost. 2^15 with r=8 is about 32 MiB — high enough to hurt
   * an offline guesser, low enough to still finish on an older phone.
   */
  N: number;
  r: number;
  p: number;
  /** 16 bytes, hex. */
  salt: string;
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  v: number;
  /** Schema version of the data inside, for a readable refusal later. */
  schema: number;
  kdf: ScryptParams;
  cipher: "aes-256-gcm";
  /** 12 bytes, hex. */
  nonce: string;
  /** Encrypted output of `encodeAppData`, hex. */
  data: string;
}

export const SCRYPT_DEFAULTS = { N: 32768, r: 8, p: 1 } as const;

const isHex = (s: unknown, bytes?: number): s is string =>
  typeof s === "string" &&
  /^[0-9a-f]*$/.test(s) &&
  s.length % 2 === 0 &&
  (bytes === undefined || s.length === bytes * 2);

export function makeBackup(parts: {
  salt: string;
  nonce: string;
  data: string;
  kdf?: Omit<ScryptParams, "name" | "salt">;
}): BackupFile {
  const { N, r, p } = parts.kdf ?? SCRYPT_DEFAULTS;
  return {
    format: BACKUP_FORMAT,
    v: BACKUP_FORMAT_VERSION,
    schema: CURRENT_SCHEMA_VERSION,
    kdf: { name: "scrypt", N, r, p, salt: parts.salt },
    cipher: "aes-256-gcm",
    nonce: parts.nonce,
    data: parts.data,
  };
}

export function serializeBackup(file: BackupFile): string {
  return JSON.stringify(file, null, 2);
}

/**
 * Parse, or throw with a reason a person can act on. Every refusal here
 * ends up in front of somebody trying to get their diary back, so
 * "Malformed" alone is not good enough.
 */
export function parseBackup(raw: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Not a backup file: the contents are not JSON.");
  }
  if (typeof parsed !== "object" || parsed === null)
    throw new Error("Not a backup file: expected an object.");

  const f = parsed as Record<string, unknown>;
  if (f.format !== BACKUP_FORMAT)
    throw new Error("Not a Sexdiary backup file.");
  if (typeof f.v !== "number")
    throw new Error("Backup file has no version.");
  if (f.v > BACKUP_FORMAT_VERSION)
    throw new Error(
      `This backup was written by a newer version of the app (format ${f.v}, this app reads ${BACKUP_FORMAT_VERSION}). Update the app and try again.`,
    );
  if (f.cipher !== "aes-256-gcm")
    throw new Error(`Unsupported cipher: ${String(f.cipher)}.`);

  const kdf = f.kdf as Record<string, unknown> | undefined;
  if (!kdf || kdf.name !== "scrypt")
    throw new Error(`Unsupported key derivation: ${String(kdf?.name)}.`);
  if (
    typeof kdf.N !== "number" ||
    typeof kdf.r !== "number" ||
    typeof kdf.p !== "number" ||
    !isHex(kdf.salt, 16)
  )
    throw new Error("Backup file has damaged key-derivation parameters.");

  if (!isHex(f.nonce, 12))
    throw new Error("Backup file has a damaged nonce.");
  if (!isHex(f.data) || f.data.length === 0)
    throw new Error("Backup file has no payload.");

  return {
    format: BACKUP_FORMAT,
    v: f.v,
    schema: typeof f.schema === "number" ? f.schema : 0,
    kdf: { name: "scrypt", N: kdf.N, r: kdf.r, p: kdf.p, salt: kdf.salt },
    cipher: "aes-256-gcm",
    nonce: f.nonce,
    data: f.data,
  };
}
