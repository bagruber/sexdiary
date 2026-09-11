import { describe, expect, it } from "vitest";
import {
  BACKUP_FORMAT_VERSION,
  makeBackup,
  parseBackup,
  serializeBackup,
} from "../src/index.js";

const salt = "0".repeat(32);
const nonce = "1".repeat(24);
const good = () => makeBackup({ salt, nonce, data: "abcdef" });

describe("backup file", () => {
  it("survives a round trip", () => {
    expect(parseBackup(serializeBackup(good()))).toEqual(good());
  });

  it("carries the parameters it was written with, so cost can rise later", () => {
    const f = makeBackup({ salt, nonce, data: "ab", kdf: { N: 1024, r: 4, p: 2 } });
    const back = parseBackup(serializeBackup(f));
    expect(back.kdf).toMatchObject({ N: 1024, r: 4, p: 2 });
  });

  it("refuses a file from a newer app, and says so", () => {
    const raw = serializeBackup({ ...good(), v: BACKUP_FORMAT_VERSION + 1 });
    expect(() => parseBackup(raw)).toThrow(/newer version/i);
  });

  it("names what is wrong rather than saying malformed", () => {
    expect(() => parseBackup("not json")).toThrow(/not JSON/i);
    expect(() => parseBackup(JSON.stringify({ format: "other" }))).toThrow(
      /not a sexdiary backup/i,
    );
    expect(() =>
      parseBackup(serializeBackup({ ...good(), cipher: "rot13" as never })),
    ).toThrow(/unsupported cipher/i);
    expect(() =>
      parseBackup(
        serializeBackup({
          ...good(),
          kdf: { ...good().kdf, name: "md5" as never },
        }),
      ),
    ).toThrow(/unsupported key derivation/i);
  });

  it("rejects damaged salt, nonce and payload by length", () => {
    for (const broken of [
      { ...good(), kdf: { ...good().kdf, salt: "abcd" } },
      { ...good(), nonce: "abcd" },
      { ...good(), data: "" },
    ]) {
      expect(() => parseBackup(serializeBackup(broken))).toThrow();
    }
  });
});
