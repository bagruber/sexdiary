/**
 * Web storage adapter: localStorage bytes around the core storage
 * envelope (versioning, migrations, sanitization live in core).
 */
import {
  decodeAppData,
  encodeAppData,
  freshAppData,
  type AppData,
  type Lang,
} from "@sexdiary/core";

const KEY = "sexdiary.v1.appData";
const CORRUPT_KEY = `${KEY}.corrupt`;

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
}

export function loadAppData(): AppData {
  if (typeof localStorage === "undefined") return freshAppData(detectLang());
  const raw = localStorage.getItem(KEY);
  if (!raw) return freshAppData(detectLang());
  try {
    return decodeAppData(raw, detectLang());
  } catch (e) {
    // Never silently destroy data: quarantine the unreadable blob so it
    // can be recovered manually, then start fresh.
    console.warn("Stored data unreadable; quarantined under", CORRUPT_KEY, e);
    try {
      localStorage.setItem(CORRUPT_KEY, raw);
    } catch {
      /* quota — nothing more we can do */
    }
    return freshAppData(detectLang());
  }
}

export function saveAppData(data: AppData): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, encodeAppData(data));
  } catch (e) {
    console.warn("Storage save failed", e);
  }
}

export function clearAppData(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
