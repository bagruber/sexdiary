import type { ActKey, PartnerAnatomy, RiskLevel } from "./domain.js";

/**
 * Where every number here comes from is written down in
 * `architecture/risikomodell-quellen.md` — including the ones that have
 * no source. Four values are recorded there as probably wrong; they are
 * left standing until a clinician has ruled on them, because quietly
 * adjusting a medical model from a literature search is the same
 * mistake as writing it without sources, only harder to notice.
 *
 *   wd  days until a test becomes meaningful
 *   p   per-act transmission probability
 *   c   relative reduction from condom use
 *   r   the ordinal level shown to the user — not a medical quantity
 */

export interface StiTx {
  r: RiskLevel;
  p: number;
  c: number;
}
export interface StiInfo {
  wd: number;
  sym: string[];
  tx: Record<ActKey, StiTx>;
}

export const STI_DB: Record<string, StiInfo> = {
  HIV: {
    // CDC: a 4th-generation lab test detects most infections at 18-45
    // days. 45 is the conservative end of that range.
    wd: 45,
    sym: [
      "Flu-like illness 2–4 wk post-exposure",
      "Fever, fatigue, swollen lymph nodes",
      "Often completely asymptomatic",
    ],
    // Patel et al. 2014, AIDS 28(10):1509-19, per 10 000 exposures:
    // 138 / 11 / 8 / 4. Condom factor: Weller & Davis, Cochrane 2002.
    // The oral values are this package's own conservative floor — the
    // review reports "low, 0-4 per 10 000", not a point estimate.
    tx: {
      recAnal: { r: "very_high", p: 0.0138, c: 0.8 },
      insAnal: { r: "high", p: 0.0011, c: 0.8 },
      recVag: { r: "moderate", p: 0.0008, c: 0.8 },
      insVag: { r: "moderate", p: 0.0004, c: 0.8 },
      recOral: { r: "negligible", p: 0.00002, c: 0.9 },
      insOral: { r: "negligible", p: 0.00001, c: 0.9 },
      manual: { r: "none", p: 0, c: 1 },
      kissing: { r: "none", p: 0, c: 1 },
    },
  },
  Gonorrhea: {
    // Open finding: NAAT is usually given as 1-2 weeks. 7 is the very
    // bottom of that.
    wd: 7,
    sym: [
      "Discharge (genital, anal, throat)",
      "Burning urination",
      "Often asymptomatic",
    ],
    tx: {
      recAnal: { r: "high", p: 0.17, c: 0.9 },
      insAnal: { r: "moderate", p: 0.06, c: 0.9 },
      recVag: { r: "high", p: 0.35, c: 0.9 },
      insVag: { r: "high", p: 0.25, c: 0.9 },
      recOral: { r: "moderate", p: 0.15, c: 0.7 },
      insOral: { r: "moderate", p: 0.1, c: 0.7 },
      manual: { r: "none", p: 0, c: 1 },
      kissing: { r: "none", p: 0, c: 1 },
    },
  },
  Chlamydia: {
    wd: 14,
    sym: [
      "Usually asymptomatic",
      "Discharge or painful urination",
      "Rectal discomfort",
    ],
    tx: {
      recAnal: { r: "high", p: 0.19, c: 0.9 },
      insAnal: { r: "moderate", p: 0.08, c: 0.9 },
      recVag: { r: "high", p: 0.3, c: 0.9 },
      insVag: { r: "high", p: 0.2, c: 0.9 },
      recOral: { r: "low", p: 0.02, c: 0.7 },
      insOral: { r: "low", p: 0.01, c: 0.7 },
      manual: { r: "none", p: 0, c: 1 },
      kissing: { r: "none", p: 0, c: 1 },
    },
  },
  Syphilis: {
    // Open finding: serology usually turns positive 3-6 weeks after the
    // chancre, with retesting advised at 6 and 12 weeks.
    wd: 21,
    sym: [
      "Painless ulcer (chancre)",
      "Rash on palms and soles",
      "Easy to miss",
    ],
    tx: {
      recAnal: { r: "high", p: 0.14, c: 0.5 },
      insAnal: { r: "high", p: 0.14, c: 0.5 },
      recVag: { r: "high", p: 0.14, c: 0.5 },
      insVag: { r: "high", p: 0.14, c: 0.5 },
      recOral: { r: "moderate", p: 0.05, c: 0.3 },
      insOral: { r: "moderate", p: 0.05, c: 0.3 },
      manual: { r: "low", p: 0.01, c: 0.5 },
      kissing: { r: "low", p: 0.005, c: 0 },
    },
  },
  "Hep B": {
    wd: 45,
    sym: ["Jaundice", "Fatigue and nausea", "Often asymptomatic"],
    tx: {
      recAnal: { r: "very_high", p: 0.37, c: 0.85 },
      insAnal: { r: "high", p: 0.2, c: 0.85 },
      recVag: { r: "moderate", p: 0.06, c: 0.85 },
      insVag: { r: "moderate", p: 0.04, c: 0.85 },
      recOral: { r: "low", p: 0.01, c: 0.5 },
      insOral: { r: "low", p: 0.01, c: 0.5 },
      manual: { r: "none", p: 0, c: 1 },
      kissing: { r: "none", p: 0, c: 1 },
    },
  },
  "HSV-2": {
    // Open finding: IgG seroconversion takes 3-12 weeks. At 16 days the
    // app calls a test meaningful when a negative rules nothing out.
    wd: 16,
    sym: [
      "Blisters or sores",
      "Burning or itching",
      "Often mild or asymptomatic",
    ],
    tx: {
      recAnal: { r: "high", p: 0.1, c: 0.3 },
      insAnal: { r: "high", p: 0.1, c: 0.3 },
      recVag: { r: "moderate", p: 0.08, c: 0.3 },
      insVag: { r: "moderate", p: 0.08, c: 0.3 },
      recOral: { r: "low", p: 0.02, c: 0.2 },
      insOral: { r: "low", p: 0.02, c: 0.2 },
      manual: { r: "very_low", p: 0.005, c: 0.2 },
      kissing: { r: "none", p: 0, c: 0 },
    },
  },
  Mpox: {
    // Open finding: mpox is diagnosed by PCR from lesion material.
    // There is no serological window to wait out, so this number is
    // answering a question that does not arise.
    wd: 21,
    sym: [
      "Rash → pustules",
      "Fever, swollen lymph nodes",
      "Lesions near genitals/anus",
    ],
    tx: {
      recAnal: { r: "very_high", p: 0.2, c: 0.4 },
      insAnal: { r: "high", p: 0.15, c: 0.4 },
      recVag: { r: "moderate", p: 0.08, c: 0.4 },
      insVag: { r: "moderate", p: 0.08, c: 0.4 },
      recOral: { r: "moderate", p: 0.06, c: 0.3 },
      insOral: { r: "moderate", p: 0.06, c: 0.3 },
      manual: { r: "low", p: 0.02, c: 0.3 },
      kissing: { r: "low", p: 0.02, c: 0.2 },
    },
  },
};

export const STI_NAMES = Object.keys(STI_DB);

export const ACT_NEEDS: Record<ActKey, PartnerAnatomy | null> = {
  recAnal: "penis",
  insAnal: null,
  recVag: "penis",
  insVag: "vagina",
  recOral: null,
  insOral: null,
  manual: null,
  kissing: null,
};

export const LOW_RISK_ACTIVITIES: ActKey[] = ["kissing", "manual"];

export const WIKI: Record<string, string> = {
  HIV: "https://en.wikipedia.org/wiki/HIV/AIDS",
  Gonorrhea: "https://en.wikipedia.org/wiki/Gonorrhea",
  Chlamydia: "https://en.wikipedia.org/wiki/Chlamydia",
  Syphilis: "https://en.wikipedia.org/wiki/Syphilis",
  "Hep B": "https://en.wikipedia.org/wiki/Hepatitis_B",
  "HSV-2": "https://en.wikipedia.org/wiki/Herpes_simplex_virus",
  Mpox: "https://en.wikipedia.org/wiki/Mpox",
};

export const COUNTRIES = [
  "Germany",
  "Austria",
  "Switzerland",
  "United Kingdom",
  "France",
  "Netherlands",
  "Belgium",
  "Spain",
  "Italy",
  "Portugal",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "Australia",
  "South Africa",
  "Nigeria",
  "Kenya",
  "India",
  "Thailand",
  "Japan",
  "China",
  "Russia",
];

/**
 * Drives the "elevated prevalence" hint. No source, no date, no
 * criterion — see section 6 of the sources document. Either put it on a
 * dated source or drop it; it currently reads to the user as fact.
 */
export const HIGH_PREVALENCE: Record<string, string[]> = {
  "South Africa": ["HIV", "Syphilis", "Gonorrhea", "Chlamydia", "HSV-2"],
  Nigeria: ["HIV", "Syphilis", "Gonorrhea", "Hep B"],
  Kenya: ["HIV", "Syphilis", "Gonorrhea", "HSV-2"],
  India: ["HIV", "Syphilis", "Gonorrhea", "Hep B"],
  Thailand: ["HIV", "Gonorrhea", "Chlamydia", "Syphilis"],
  Brazil: ["HIV", "Syphilis", "Gonorrhea", "Hep B"],
  Russia: ["HIV", "Syphilis", "Hep B"],
  China: ["Hep B", "Syphilis", "Gonorrhea"],
  "United States": ["Syphilis", "Gonorrhea", "Chlamydia"],
  "United Kingdom": ["Gonorrhea", "Chlamydia", "Syphilis"],
  Germany: ["Syphilis", "Gonorrhea", "Chlamydia"],
  France: ["Gonorrhea", "Chlamydia"],
  Australia: ["Gonorrhea", "Chlamydia", "Syphilis"],
  Mexico: ["HIV", "Syphilis"],
};
