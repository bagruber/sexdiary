import { describe, expect, it } from "vitest";
import {
  BRAND,
  CATEGORY_DARK,
  CATEGORY_LIGHT,
  DARK,
  LIGHT,
  contrast,
  riskColor,
  type CategoryScale,
  type Palette,
} from "../src/tokens";
import { RISK_ORDER, type RiskLevel } from "../src/domain";

/** WCAG 2.1 AA, via BITV 2.0: 4.5:1 for text, 3:1 for controls. */
const TEXT = 4.5;
const CONTROL = 3;

const themes: [string, Palette][] = [
  ["light", LIGHT],
  ["dark", DARK],
];

describe("contrast", () => {
  it("computes known reference values", () => {
    expect(contrast("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  describe.each(themes)("%s theme", (_name, p) => {
    const grounds = [p.bg, p.card];

    it.each(["text", "sub", "good", "warn", "bad"] as const)(
      "%s reads on both backgrounds",
      (role) => {
        for (const ground of grounds) {
          expect(contrast(p[role], ground)).toBeGreaterThanOrEqual(TEXT);
        }
      },
    );

    it("accent works as a control on both backgrounds", () => {
      for (const ground of grounds) {
        expect(contrast(p.accent, ground)).toBeGreaterThanOrEqual(CONTROL);
      }
    });

    it("accentText reads on accent", () => {
      expect(contrast(p.accentText, p.accent)).toBeGreaterThanOrEqual(TEXT);
    });

    it("keeps the three semantic colours within one step of each other", () => {
      // If "act on this" is the least legible of the three, the scale is
      // backwards. Parity matters more than any single value.
      const ratios = [p.good, p.warn, p.bad].map((c) => contrast(c, p.bg));
      expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(2);
    });
  });
});

describe("brand", () => {
  it("carries its own foreground", () => {
    expect(contrast(BRAND.onSurface, BRAND.surface)).toBeGreaterThanOrEqual(
      TEXT,
    );
  });

  it("is unusable as a foreground — which is why it is surface-only", () => {
    for (const ground of [LIGHT.bg, LIGHT.card]) {
      expect(contrast(BRAND.surface, ground)).toBeLessThan(CONTROL);
    }
  });
});

describe("riskColor", () => {
  const levels = Object.keys(RISK_ORDER) as RiskLevel[];

  it.each(themes)("%s: every level reads as text", (_name, p) => {
    for (const level of levels) {
      expect(contrast(riskColor(p, level), p.card)).toBeGreaterThanOrEqual(
        TEXT,
      );
    }
  });

  it("rises monotonically through the scale", () => {
    const rank = [LIGHT.sub, LIGHT.good, LIGHT.warn, LIGHT.bad];
    const seen = levels
      .sort((a, b) => RISK_ORDER[a] - RISK_ORDER[b])
      .map((l) => rank.indexOf(riskColor(LIGHT, l)));
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
  });

  it("falls back to the neutral colour for an unrated level", () => {
    expect(riskColor(LIGHT, undefined)).toBe(LIGHT.sub);
  });
});

describe("category scale", () => {
  /**
   * Farbton in Grad. Nur hier, nicht in `tokens.ts`: die Skala selbst
   * rechnet damit nicht, allein dieser Test tut es.
   */
  const hue = (hex: string): number => {
    const n = Number.parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(
      (v) => v / 255,
    );
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    if (d === 0) return 0;
    const h =
      max === r
        ? ((g - b) / d) % 6
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  };

  /** Kuerzester Weg auf dem Farbkreis, 0 bis 180. */
  const apart = (a: number, b: number): number => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };

  const scales: [string, CategoryScale, Palette][] = [
    ["light", CATEGORY_LIGHT, LIGHT],
    ["dark", CATEGORY_DARK, DARK],
  ];

  describe.each(scales)("%s", (_name, cat, p) => {
    const fills = Object.entries(cat.fill);

    it.each(fills)("%s carries its own foreground", (_kind, fill) => {
      expect(contrast(cat.on, fill)).toBeGreaterThanOrEqual(TEXT);
    });

    it.each(fills)("%s works as a control on both grounds", (_kind, fill) => {
      for (const ground of [p.bg, p.card]) {
        expect(contrast(fill, ground)).toBeGreaterThanOrEqual(CONTROL);
      }
    });

    it("stays clear of the risk ramp", () => {
      // Der Grund, warum es diese Skala ueberhaupt geben darf: sie
      // greift die Farbtoene nicht an, die Risiko bedeuten. Wer hier
      // einen Wert nach Gefuehl verschiebt, faellt hier auf.
      const risk = [p.good, p.warn, p.bad].map(hue);
      for (const [, fill] of fills) {
        for (const r of risk) {
          expect(apart(hue(fill), r)).toBeGreaterThanOrEqual(25);
        }
      }
    });

    it("keeps the four apart from each other", () => {
      const hues = fills.map(([, fill]) => hue(fill));
      for (let i = 0; i < hues.length; i++) {
        for (let j = i + 1; j < hues.length; j++) {
          expect(apart(hues[i]!, hues[j]!)).toBeGreaterThanOrEqual(30);
        }
      }
    });
  });
});
