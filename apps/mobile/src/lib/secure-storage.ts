/**
 * Encrypted-at-rest storage adapter.
 *
 * Layers:
 *   1. 256-bit master key, generated once from the OS CSPRNG and held in
 *      the iOS Keychain / Android Keystore via expo-secure-store with
 *      WHEN_UNLOCKED_THIS_DEVICE_ONLY — hardware-backed where available,
 *      never included in device backups or cloud keychain sync.
 *   2. App data serialized through the core storage envelope
 *      (versioning + migrations), then encrypted with AES-256-GCM
 *      (@noble/ciphers — audited, pure TypeScript, no native code) under
 *      a fresh random 96-bit nonce per write.
 *   3. Ciphertext stored via AsyncStorage. AsyncStorage itself is
 *      unencrypted, which is fine: it only ever sees ciphertext, and the
 *      key never leaves the platform keystore layer.
 *
 * Threat model notes: protects data at rest against extraction without
 * the unlocked keystore (e.g. filesystem/backup access). It does not
 * protect against an attacker holding the unlocked phone — that is the
 * job of the app-lock milestone (biometric gate).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as ExpoCrypto from "expo-crypto";
import { gcm } from "@noble/ciphers/aes.js";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils.js";
import {
  decodeAppData,
  encodeAppData,
  freshAppData,
  type AppData,
  type Lang,
} from "@sexdiary/core";

const KEY_NAME = "sexdiary.v1.masterKey";
const DATA_KEY = "sexdiary.v1.encrypted";
const CORRUPT_KEY = `${DATA_KEY}.corrupt`;
const NONCE_BYTES = 12;

async function getMasterKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(KEY_NAME);
  if (existing) return hexToBytes(existing);
  const key = ExpoCrypto.getRandomValues(new Uint8Array(32));
  await SecureStore.setItemAsync(KEY_NAME, bytesToHex(key), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

function encrypt(key: Uint8Array, plaintext: string): string {
  const nonce = ExpoCrypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const ciphertext = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
  return `${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`;
}

function decrypt(key: Uint8Array, stored: string): string {
  const [nonceHex, ctHex] = stored.split(":");
  if (!nonceHex || !ctHex) throw new Error("Malformed encrypted record");
  const plaintext = gcm(key, hexToBytes(nonceHex)).decrypt(hexToBytes(ctHex));
  return bytesToUtf8(plaintext);
}

export async function loadAppData(lang: Lang): Promise<AppData> {
  const stored = await AsyncStorage.getItem(DATA_KEY);
  if (!stored) return freshAppData(lang);
  try {
    const key = await getMasterKey();
    return decodeAppData(decrypt(key, stored), lang);
  } catch (e) {
    // Never silently destroy data: quarantine the unreadable blob.
    console.warn("Stored data unreadable; quarantined", e);
    await AsyncStorage.setItem(CORRUPT_KEY, stored).catch(() => {});
    return freshAppData(lang);
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  const key = await getMasterKey();
  await AsyncStorage.setItem(DATA_KEY, encrypt(key, encodeAppData(data)));
}

export async function clearAppData(): Promise<void> {
  await AsyncStorage.removeItem(DATA_KEY);
}
