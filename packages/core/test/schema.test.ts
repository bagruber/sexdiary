import { describe, expect, it } from "vitest";
import { parseBackupPayload, parseImportPayload } from "../src/schema";

const validTest = {
  v: 1,
  type: "test_result",
  date: "2026-05-15",
  facility: "City Health Clinic",
  num: "T-2026-009",
  ts: { HIV: 1, Syphilis: 1 },
  results: { HIV: "negative", Syphilis: "positive" },
};

const validContact = {
  v: 1,
  type: "contact",
  token: "a3f8c1d902e74b6f19a8c3d2",
  platform: "telegram",
  handle: "someone",
  name: "Alex",
};

describe("parseImportPayload — test results", () => {
  it("accepts a well-formed payload", () => {
    const r = parseImportPayload(JSON.stringify(validTest));
    if (r.kind !== "test") throw new Error(`expected test, got ${r.kind}`);
    expect(r.record.date).toBe("2026-05-15");
    expect(r.record.results?.Syphilis).toBe("positive");
    expect(r.record.id).toMatch(/^t_/);
  });

  it("rejects malformed dates", () => {
    const r = parseImportPayload(
      JSON.stringify({ ...validTest, date: "15.05.2026" }),
    );
    expect(r.kind).toBe("error");
  });

  it("drops non-enum result values and errors when nothing survives", () => {
    const r = parseImportPayload(
      JSON.stringify({ ...validTest, results: { HIV: "definitely fine" } }),
    );
    expect(r.kind).toBe("error");
  });

  it("rejects oversized payloads", () => {
    const r = parseImportPayload("x".repeat(20_001));
    expect(r.kind).toBe("error");
  });

  it("rejects unknown versions and types", () => {
    expect(parseImportPayload(JSON.stringify({ ...validTest, v: 2 })).kind).toBe(
      "error",
    );
    expect(
      parseImportPayload(JSON.stringify({ ...validTest, type: "wat" })).kind,
    ).toBe("error");
  });
});

describe("parseImportPayload — contacts", () => {
  it("accepts a well-formed contact", () => {
    const r = parseImportPayload(JSON.stringify(validContact));
    if (r.kind !== "contact") throw new Error(`expected contact, got ${r.kind}`);
    expect(r.record.token).toBe(validContact.token);
    expect(r.record.cx.telegram).toBe("someone");
    expect(r.record.name).toBe("Alex");
  });

  it("rejects non-hex or short tokens", () => {
    expect(
      parseImportPayload(JSON.stringify({ ...validContact, token: "zzz" })).kind,
    ).toBe("error");
    expect(
      parseImportPayload(JSON.stringify({ ...validContact, token: "abcd" }))
        .kind,
    ).toBe("error");
  });

  it("ignores unknown platforms instead of storing them", () => {
    const r = parseImportPayload(
      JSON.stringify({ ...validContact, platform: "myspace" }),
    );
    if (r.kind !== "contact") throw new Error(`expected contact, got ${r.kind}`);
    expect(r.record.cx).toEqual({});
  });

  it("clips overlong text fields", () => {
    const r = parseImportPayload(
      JSON.stringify({ ...validContact, name: "N".repeat(1000) }),
    );
    if (r.kind !== "contact") throw new Error(`expected contact, got ${r.kind}`);
    expect(r.record.name.length).toBeLessThanOrEqual(200);
  });
});

describe("parseBackupPayload", () => {
  it("imports valid collections and counts dropped rows", () => {
    const r = parseBackupPayload(
      JSON.stringify({
        contacts: [
          { id: "c1", name: "A", token: "a3f8c1d902e74b6f19a8c3d2", cx: {} },
          { id: "bad", name: 5, token: "nope" },
        ],
        intercourse: [
          { id: "i1", date: "2026-01-05", cid: "c1", t: { recAnal: 1 }, p: {} },
          { id: "bad", date: "not a date" },
        ],
        tests: [
          { id: "t1", date: "2026-02-01", ts: { HIV: 1 }, results: { HIV: "negative" } },
        ],
      }),
    );
    if (r.kind !== "backup") throw new Error("expected backup");
    expect(r.data.contacts).toHaveLength(1);
    expect(r.data.intercourse).toHaveLength(1);
    expect(r.data.intercourse?.[0].t.recAnal).toBe(1);
    expect(r.data.intercourse?.[0].t.kissing).toBe(0);
    expect(r.data.tests).toHaveLength(1);
    expect(r.dropped).toBe(2);
  });

  it("sanitizes the profile", () => {
    const r = parseBackupPayload(
      JSON.stringify({
        tests: [],
        profile: { age: "30", pa: "starfish", conditions: ["HSV-2", 42] },
      }),
    );
    if (r.kind !== "backup") throw new Error("expected backup");
    expect(r.data.profile?.pa).toBe("both");
    expect(r.data.profile?.conditions).toEqual(["HSV-2"]);
  });

  it("errors on unrecognizable input", () => {
    expect(parseBackupPayload("[]").kind).toBe("error");
    expect(parseBackupPayload("{}").kind).toBe("error");
    expect(parseBackupPayload("not json").kind).toBe("error");
  });
});
