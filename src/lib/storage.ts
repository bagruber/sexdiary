import type { AppData } from "../types/domain";
import { freshAppData } from "../data/seed";

const KEY = "sexdiary.v1.appData";

export function loadAppData(): AppData {
  if (typeof localStorage === "undefined") return freshAppData();
  const raw = localStorage.getItem(KEY);
  if (!raw) return freshAppData();
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const base = freshAppData();
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      prefs: { ...base.prefs, ...(parsed.prefs ?? {}) },
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
