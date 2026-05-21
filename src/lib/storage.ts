import type { AppData } from "../types/domain";
import { freshAppData } from "../data/seed";

const KEY = "sexdiary.v1.appData";

export function loadAppData(): AppData {
  if (typeof localStorage === "undefined") return freshAppData();
  const raw = localStorage.getItem(KEY);
  if (!raw) return freshAppData();
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const base = freshAppData();
    const profileRaw = (parsed.profile as Record<string, unknown> | undefined) ?? {};
    const conditions = Array.isArray(profileRaw.conditions)
      ? (profileRaw.conditions as string[])
      : [];
    const prefsRaw = (parsed.prefs as Record<string, unknown> | undefined) ?? {};
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...profileRaw, conditions },
      prefs: { ...base.prefs, ...prefsRaw },
    } as AppData;
  } catch {
    return freshAppData();
  }
}

export function saveAppData(data: AppData): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage save failed", e);
  }
}

export function clearAppData(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
