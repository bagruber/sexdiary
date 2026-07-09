import type { RiskLevel, Theme } from "@sexdiary/core";

export interface Palette {
  bg: string;
  card: string;
  cardEl: string;
  border: string;
  text: string;
  sub: string;
  muted: string;
  rose: string;
  teal: string;
  amber: string;
  green: string;
  overlay: string;
}

export const LIGHT: Palette = {
  bg: "#F5F3EF",
  card: "#FFFFFF",
  cardEl: "#EFECEA",
  border: "#E3DFD8",
  text: "#1F1D2B",
  sub: "#4A4860",
  muted: "#807C8F",
  rose: "#C94D5E",
  teal: "#238A8E",
  amber: "#BE7B2A",
  green: "#3D8F5A",
  overlay: "rgba(0,0,0,.3)",
};

export const DARK: Palette = {
  bg: "#16161D",
  card: "#1F1F28",
  cardEl: "#2A2A35",
  border: "#33333F",
  text: "#F2F0EA",
  sub: "#C9C5BC",
  muted: "#8A8696",
  rose: "#E27384",
  teal: "#4FB4B8",
  amber: "#D9A24C",
  green: "#6CB088",
  overlay: "rgba(0,0,0,.55)",
};

export function resolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function paletteFor(theme: Theme): Palette {
  return resolvedTheme(theme) === "dark" ? DARK : LIGHT;
}

export function riskColor(r: RiskLevel | undefined): string {
  return (
    {
      none: "#6CB088",
      negligible: "#6BC98F",
      very_low: "#8ABB3A",
      low: "#D4B033",
      moderate: "#E08840",
      high: "#DB5E5E",
      very_high: "#C4264A",
    }[r ?? "none"] ?? "#999"
  );
}
