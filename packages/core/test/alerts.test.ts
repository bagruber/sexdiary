import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  appReducer,
  decodeAppData,
  freshAppData,
  type SentAlert,
} from "../src/index.js";

const alert = (over: Partial<SentAlert> = {}): SentAlert => ({
  id: "a1",
  cid: "c1",
  sti: "Chlamydia",
  sentAt: "2026-09-01",
  channel: "personal",
  ...over,
});

describe("gesendete Benachrichtigungen", () => {
  it("kommt bei einem Stand ohne das Feld als leere Liste an", () => {
    const alt = JSON.stringify({
      v: 3,
      savedAt: "2026-08-01T00:00:00.000Z",
      data: { ...freshAppData("de"), alerts: undefined },
    });
    expect(decodeAppData(alt, "de").alerts).toEqual([]);
  });

  it("liest einen v4-Stand mit Eintraegen zurueck", () => {
    const data = { ...freshAppData("de"), alerts: [alert()] };
    const raw = JSON.stringify({
      v: CURRENT_SCHEMA_VERSION,
      savedAt: "2026-09-01T00:00:00.000Z",
      data,
    });
    expect(decodeAppData(raw, "de").alerts).toHaveLength(1);
  });

  it("fuehrt je Kontakt und Erreger nur einen Eintrag", () => {
    let state = { ...freshAppData("de"), alerts: [] as SentAlert[] };
    state = appReducer(state, { type: "saveAlert", payload: alert() });
    state = appReducer(state, {
      type: "saveAlert",
      payload: alert({ id: "a2", channel: "relay" }),
    });
    expect(state.alerts).toHaveLength(1);
    expect(state.alerts[0]).toMatchObject({ id: "a2", channel: "relay" });
  });

  it("trennt nach Erreger", () => {
    let state = { ...freshAppData("de"), alerts: [] as SentAlert[] };
    state = appReducer(state, { type: "saveAlert", payload: alert() });
    state = appReducer(state, {
      type: "saveAlert",
      payload: alert({ id: "a2", sti: "Gonorrhea" }),
    });
    expect(state.alerts).toHaveLength(2);
  });
});
