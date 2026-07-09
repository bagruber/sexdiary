export const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";

export const shadow = (dark: boolean) =>
  dark ? "0 1px 4px rgba(0,0,0,.35)" : "0 1px 4px rgba(0,0,0,.06)";

export const shadowLg = (dark: boolean) =>
  dark ? "0 12px 36px rgba(0,0,0,.55)" : "0 8px 28px rgba(0,0,0,.14)";

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 22,
} as const;
