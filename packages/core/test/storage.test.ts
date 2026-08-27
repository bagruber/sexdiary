import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  StorageDecodeError,
  decodeAppData,
  encodeAppData,
} from "../src/storage";
import { freshAppData } from "../src/seed";

describe("storage envelope", () => {
  it("round-trips app data", () => {
    const original = freshAppData("de");
    original.onboarded = true;
    const decoded = decodeAppData(encodeAppData(original), "de");
    expect(decoded).toEqual(original);
  });

  it("stamps the current schema version", () => {
    const env = JSON.parse(encodeAppData(freshAppData()));
    expect(env.v).toBe(CURRENT_SCHEMA_VERSION);
    expect(typeof env.savedAt).toBe("string");
  });

  it("migrates legacy v1 bare objects", () => {
    const legacy = { ...freshAppData("en"), onboarded: true };
    const decoded = decodeAppData(JSON.stringify(legacy), "en");
    expect(decoded.onboarded).toBe(true);
    expect(decoded.contacts).toEqual(legacy.contacts);
  });

  describe("v2 → v3: the app-owned PIN is dropped", () => {
    const v2 = (lockPin: string | null) =>
      JSON.stringify({
        v: 2,
        savedAt: "2026-08-01T00:00:00.000Z",
        data: { ...freshAppData("de"), prefs: { ...freshAppData("de").prefs, lockPin } },
      });

    it("carries a set PIN over as a switched-on lock", () => {
      // Someone who had a PIN wanted a lock. Migrating them to lock:false
      // would quietly unlock an app they had deliberately protected.
      const decoded = decodeAppData(v2("1234"), "de");
      expect(decoded.prefs.lock).toBe(true);
    });

    it("leaves the lock off when there was no PIN", () => {
      expect(decodeAppData(v2(null), "de").prefs.lock).toBe(false);
    });

    it("does not carry the PIN into the new shape", () => {
      const decoded = decodeAppData(v2("1234"), "de");
      expect("lockPin" in decoded.prefs).toBe(false);
    });
  });

  it("fills defaults for missing prefs and profile fields", () => {
    const decoded = decodeAppData(
      JSON.stringify({ contacts: [], tests: [], prefs: { lang: "de" } }),
      "en",
    );
    expect(decoded.prefs.lang).toBe("de");
    expect(decoded.prefs.theme).toBeDefined();
    expect(decoded.profile.conditions).toEqual([]);
    expect(decoded.contacts).toEqual([]);
  });

  it("rejects data from a newer schema", () => {
    const raw = JSON.stringify({ v: CURRENT_SCHEMA_VERSION + 1, data: {} });
    expect(() => decodeAppData(raw)).toThrow(StorageDecodeError);
  });

  it("rejects garbage", () => {
    expect(() => decodeAppData("not json")).toThrow(StorageDecodeError);
    expect(() => decodeAppData("[1,2,3]")).toThrow(StorageDecodeError);
  });
});
