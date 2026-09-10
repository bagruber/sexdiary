import type { RiskLevel } from "./domain.js";

/**
 * Colour tokens. Two scales that must never touch: the interaction scale
 * (identity, buttons, navigation) and the semantic scale (the risk
 * rating — the actual content). If a control and a warning look alike,
 * colour stops carrying meaning in an app where it carries the message.
 *
 * Every value here is contrast-checked against both backgrounds of its
 * theme in `test/tokens.test.ts`. Change a value, run the test.
 */
export interface Palette {
  /** Screen background. */
  bg: string;
  /** Raised surface on top of `bg`. */
  card: string;
  /** Body text. */
  text: string;
  /** Secondary text, and the neutral end of the risk scale. */
  sub: string;
  /** Hairlines and dividers — decorative, exempt from contrast rules. */
  border: string;
  /** The single interaction colour: buttons, links, active states. */
  accent: string;
  /** Text on top of `accent`. */
  accentText: string;
  /** Semantic: nothing to do. */
  good: string;
  /** Semantic: elevated. */
  warn: string;
  /** Semantic: act on this. */
  bad: string;
}

export const LIGHT: Palette = {
  bg: "#F5F3EF",
  card: "#FFFFFF",
  text: "#14262B",
  sub: "#5A6B70",
  border: "#E3E0D8",
  accent: "#14262B",
  accentText: "#FFFFFF",
  good: "#2B7A4E",
  warn: "#8C6208",
  bad: "#C0392B",
};

export const DARK: Palette = {
  bg: "#0D1A1E",
  card: "#142429",
  text: "#E6EFEF",
  sub: "#8FA5AA",
  border: "#234047",
  accent: "#E6EFEF",
  accentText: "#0D1A1E",
  good: "#5BBB8A",
  warn: "#D9A441",
  bad: "#E87A6A",
};

/**
 * Brand mark. Munich yellow is a surface, never a foreground: at 1.8:1
 * on white it cannot carry text or an icon, and on the risk scale
 * yellow already means "elevated". It belongs on the app icon, the
 * splash and the information site — not on a control.
 */
export const BRAND = {
  surface: "#F2B705",
  /** The only foreground allowed on `surface` (9.10:1). */
  onSurface: "#14262B",
} as const;

/**
 * Seven risk levels, four colours. A seven-step ramp cannot be told
 * apart, and the levels that matter most sat at the low-contrast end of
 * the previous one. The level *name* is the discriminator; colour only
 * groups the levels into "nothing to do", "elevated" and "act on this".
 */
export function riskColor(p: Palette, level: RiskLevel | undefined): string {
  switch (level) {
    case "very_low":
    case "low":
      return p.good;
    case "moderate":
      return p.warn;
    case "high":
    case "very_high":
      return p.bad;
    default:
      return p.sub;
  }
}

export function paletteFor(scheme: "light" | "dark"): Palette {
  return scheme === "dark" ? DARK : LIGHT;
}

const channel = (c: number): number =>
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/** WCAG 2.1 relative luminance of a `#rrggbb` colour. */
function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    channel(v / 255),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Contrast ratio between two `#rrggbb` colours, 1 to 21. The thresholds
 * that matter here are 4.5 for text and 3 for controls (WCAG 2.1 AA,
 * which BITV 2.0 refers to).
 *
 * Exported because two callers need the same arithmetic: the test that
 * guards the palette, and the token documentation page, which computes
 * its own figures rather than repeating them from a table.
 */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
