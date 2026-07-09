/**
 * ID and token generation. Uses the runtime's CSPRNG when present
 * (browsers, Node, and the mobile app after its WebCrypto polyfill
 * loads); the Math.random fallback exists only so core stays importable
 * in exotic runtimes and must not be relied on for tokens.
 */

interface RandomSource {
  getRandomValues(array: Uint8Array): Uint8Array;
}

function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  const cryptoObj = (globalThis as { crypto?: RandomSource }).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(out);
    return out;
  }
  for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  return out;
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** Record ID: 64 random bits, collision-safe across devices and imports. */
export function gid(prefix = "x"): string {
  return `${prefix}_${toHex(randomBytes(8))}`;
}

/** Anonymous notification token: 96 random bits, hex. */
export function genToken(): string {
  return toHex(randomBytes(12));
}
