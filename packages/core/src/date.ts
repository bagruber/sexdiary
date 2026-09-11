import type { Lang } from "./domain.js";

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

/**
 * Whole days elapsed, counted as calendar days rather than as elapsed
 * milliseconds.
 *
 * The difference is not academic. Dates in this app are days, but the
 * clock is a moment; dividing one by the other made "days since" depend
 * on the time of day. An encounter logged before noon came out as −1
 * days old, which showed a negative progress bar and put the diagnostic
 * window one day too far away. Counting days also survives the two DST
 * changes a year, where a day is 23 or 25 hours long.
 */
export const daysBetween = (a: Date | string, b: Date | string): number =>
  dayNumber(b) - dayNumber(a);

/** Days since the epoch, independent of clock time and time zone. */
const dayNumber = (d: Date | string): number => {
  const s = dateString(d);
  const [y, m, day] = s.split("-").map(Number);
  return Date.UTC(y as number, (m as number) - 1, day as number) / 86_400_000;
};
