/**
 * App lock, backed by the device's own authentication.
 *
 * What this defends against is the threat model the whole product is
 * shaped around (ADR-0001): the person sitting next to you who picks up
 * the unlocked phone. It gates the *interface*.
 *
 * What it deliberately does not do is bind the encryption key to
 * authentication (`SecureStore` can, via `requireAuthentication`). That
 * would defend against a forensic attacker with the unlocked device —
 * a much stronger attacker — but on Android the key is destroyed when
 * the enrolled biometrics change, and until the backup from ADR-0009
 * exists, that is a data-loss trap. Recorded as an open point rather
 * than shipped quietly.
 */
import * as LocalAuthentication from "expo-local-authentication";

export type LockAvailability =
  /** Biometrics enrolled: fingerprint, face, iris. */
  | "biometric"
  /** No biometrics, but the device has a PIN, pattern or passcode. */
  | "credential"
  /** Nothing to authenticate against — the lock cannot be offered. */
  | "none";

/**
 * Whether a lock can be offered at all. A switch that turns on a lock
 * the device cannot perform would be the third lying switch in this
 * settings screen, so the caller is expected to check first.
 */
export async function lockAvailability(): Promise<LockAvailability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (hasHardware && (await LocalAuthentication.isEnrolledAsync())) {
    return "biometric";
  }
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  return level === LocalAuthentication.SecurityLevel.NONE ? "none" : "credential";
}

/**
 * Prompt for authentication. `disableDeviceFallback: false` is what
 * makes the device PIN or pattern acceptable, so the lock also works on
 * phones without biometrics — and still works when a wet finger fails.
 */
export async function authenticate(prompt: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    disableDeviceFallback: false,
    cancelLabel: undefined,
  });
  return result.success;
}
