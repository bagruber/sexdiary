import { describe, expect, it } from "vitest";
import { ACT_KEYS, PROTECTABLE_ACTS, STI_DB } from "../src/index.js";

/**
 * The list is derived from STI_DB so that correcting a rate can never
 * leave the interface offering a switch that does nothing. These tests
 * pin the derivation, not a hand-written expectation of its result —
 * writing the result down would recreate the drift they prevent.
 */
describe("PROTECTABLE_ACTS", () => {
  it("holds exactly the acts where a barrier changes the arithmetic", () => {
    for (const key of ACT_KEYS) {
      const matters = Object.values(STI_DB).some(
        (s) => s.tx[key].p > 0 && s.tx[key].c > 0,
      );
      expect(PROTECTABLE_ACTS.includes(key)).toBe(matters);
    }
  });

  it("drops an act once nothing transmits through it", () => {
    // Syphilis records c: 0 for kissing — a condom does nothing there.
    // An act only survives on a non-zero reduction somewhere.
    const surviving = ACT_KEYS.filter((key) =>
      Object.values(STI_DB).every((s) => s.tx[key].c === 0),
    );
    for (const key of surviving) expect(PROTECTABLE_ACTS).not.toContain(key);
  });
});
