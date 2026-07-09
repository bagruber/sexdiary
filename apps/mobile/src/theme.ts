import type { RiskLevel } from "@sexdiary/core";

export interface MobilePalette {
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  accent: string;
  accentText: string;
  good: string;
  warn: string;
  bad: string;
}

export const light: MobilePalette = {
  bg: "#F5F3EF",
  card: "#FFFFFF",
  text: "#1F1D2B",
  sub: "#6E6A7A",
  border: "#E5E1D8",
  accent: "#1F1D2B",
  accentText: "#FFFFFF",
  good: "#2E7D52",
  warn: "#B7791F",
  bad: "#C0392B",
};

export const dark: MobilePalette = {
  bg: "#17151F",
  card: "#211E2B",
  text: "#F1EFF7",
  sub: "#9B96A8",
  border: "#322E3F",
  accent: "#F1EFF7",
  accentText: "#17151F",
  good: "#5BBB8A",
  warn: "#D9A441",
  bad: "#E06A5A",
};

export const riskColor = (
  p: MobilePalette,
): Record<RiskLevel, string> => ({
  none: p.sub,
  negligible: p.sub,
  very_low: p.good,
  low: p.good,
  moderate: p.warn,
  high: p.bad,
  very_high: p.bad,
});
