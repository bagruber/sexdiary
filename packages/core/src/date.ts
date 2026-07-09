import type { Lang } from "./domain";

export const toDate = (s: string): Date => new Date(s + "T12:00:00");

export const dateString = (d: Date | string): string => {
  if (typeof d === "string") return d;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const formatDate = (s: string, lang: Lang = "en"): string =>
  toDate(s).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const today = (): string => dateString(new Date());

export const daysBetween = (a: Date | string, b: Date | string): number => {
  const da = typeof a === "string" ? toDate(a) : a;
  const db = typeof b === "string" ? toDate(b) : b;
  return Math.floor((db.getTime() - da.getTime()) / 86_400_000);
};
