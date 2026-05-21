export const ACT_KEYS = [
  "recAnal",
  "insAnal",
  "recVag",
  "insVag",
  "recOral",
  "insOral",
  "manual",
  "kissing",
] as const;
export type ActKey = (typeof ACT_KEYS)[number];

export type RiskLevel =
  | "none"
  | "negligible"
  | "very_low"
  | "low"
  | "moderate"
  | "high"
  | "very_high";

export const RISK_ORDER: Record<RiskLevel, number> = {
  none: 0,
  negligible: 1,
  very_low: 2,
  low: 3,
  moderate: 4,
  high: 5,
  very_high: 6,
};

export type ActFlags = Record<ActKey, 0 | 1>;
export const emptyActs = (): ActFlags =>
  Object.fromEntries(ACT_KEYS.map((k) => [k, 0])) as ActFlags;

export type PartnerAnatomy = "penis" | "vagina" | "both";

export type ContactHandlePlatform =
  | "instagram"
  | "telegram"
  | "signal"
  | "whatsapp"
  | "snapchat";

export interface Contact {
  id: string;
  name: string;
  notes: string | null;
  token: string;
  cx: Partial<Record<ContactHandlePlatform, string>>;
}

export interface Intercourse {
  id: string;
  date: string; // YYYY-MM-DD
  cid: string | null;
  t: ActFlags;
  p: ActFlags;
}

export type TestResultValue = "negative" | "positive";

export interface TestRecord {
  id: string;
  date: string;
  num: string;
  fac: string;
  ts: Partial<Record<string, 0 | 1>>;
  results?: Partial<Record<string, TestResultValue>>;
}

export type VaccineKind = "vaccine" | "prep" | "doxypep";

export interface Vaccination {
  id: string;
  kind: VaccineKind;
  type?: string;
  manufacturer?: string;
  date?: string;
  dose?: number;
  startDate?: string;
  endDate?: string | null;
}

export interface Profile {
  age: string;
  pa: PartnerAnatomy;
  conditions: string[];
}

export type Lang = "en" | "de";
export type Theme = "light" | "dark" | "system";
export type ShareMode = "token" | "handle";

export interface Preferences {
  lang: Lang;
  theme: Theme;
  country: string;
  notifs: boolean;
  lock: boolean;
  highPrev: boolean;
  reducedMotion: boolean;
  hideLowRisk: boolean;
  shareMode: ShareMode;
  sharePlatform: ContactHandlePlatform;
  shareHandle: string;
}

export interface AppData {
  contacts: Contact[];
  intercourse: Intercourse[];
  tests: TestRecord[];
  vaccinations: Vaccination[];
  profile: Profile;
  prefs: Preferences;
  myToken: string;
  onboarded: boolean;
}
