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
  text: "#1F1D2B",
  sub: "#6E6A7A",
  border: "#E5E1D8",
  accent: "#1F1D2B",
  accentText: "#FFFFFF",
  good: "#2B7A4E",
  warn: "#8C6208",
  bad: "#C0392B",
};

export const DARK: Palette = {
  bg: "#17151F",
  card: "#211E2B",
  text: "#F1EFF7",
  sub: "#9B96A8",
  border: "#322E3F",
  accent: "#F1EFF7",
  accentText: "#17151F",
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
  onSurface: "#1F1D2B",
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
