import { describe, expect, it } from "vitest";
import { BRAND, DARK, LIGHT, riskColor, type Palette } from "../src/tokens";
import { RISK_ORDER, type RiskLevel } from "../src/domain";

/**
 * WCAG 2.1 relative luminance and contrast ratio. Kept here rather than
 * in `src` because nothing but this check needs it — but the check
 * itself is the point: an auditor can run `pnpm test` instead of
 * reading a bundle.
 */
const channel = (c: number): number =>
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

const luminance = (hex: string): number => {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    channel(v / 255),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

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
