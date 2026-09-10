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

export const CONTACT_PLATFORMS = [
  "instagram",
  "telegram",
  "signal",
  "whatsapp",
  "snapchat",
] as const;
export type ContactHandlePlatform = (typeof CONTACT_PLATFORMS)[number];

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

/**
 * Where a record came from. The distinction between a finding signed by
 * a test centre and one somebody typed in is the larger half of what
 * ADR-0007 buys, and it works before a single test centre takes part:
 * it turns every entry into an honestly labelled claim.
 */
export interface ResultProvenance {
  /** Key id of the issuer, as it appeared in the trust list. */
  kid: string;
  /** Display name at the time of import — kept so the record still
   *  reads correctly after the trust list changes. */
  issuer: string;
  /** The QR text, so the signature stays checkable later. */
  qr: string;
  /** When the app verified it. */
  importedAt: string;
}

export interface TestRecord {
  id: string;
  date: string;
  num: string;
  fac: string;
  ts: Partial<Record<string, 0 | 1>>;
  results?: Partial<Record<string, TestResultValue>>;
  /** Absent means self-entered. Present means it verified on import. */
  signed?: ResultProvenance;
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
  /** Remind me when a diagnostic window closes. */
  notifs: boolean;
  /**
   * Require the device's own authentication (biometric, or the device
   * PIN/pattern as fallback) before the interface is shown. Gates the
   * *interface*: the data is encrypted at rest independently of it.
   */
  lock: boolean;
  highPrev: boolean;
  reducedMotion: boolean;
  hideLowRisk: boolean;
  shareMode: ShareMode;
  sharePlatform: ContactHandlePlatform;
  shareHandle: string;
  /**
   * Present the app under a neutral identity (name, lock screen, and a
   * one-tap decoy screen). Defends against shoulder-surfing, which for
   * this app is a likelier threat than a remote attacker.
   */
  disguise: boolean;
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
