import type { ActKey, PartnerAnatomy, RiskLevel } from "./domain.js";

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
    wd: 45,
    sym: [
      "Flu-like illness 2–4 wk post-exposure",
      "Fever, fatigue, swollen lymph nodes",
      "Often completely asymptomatic",
    ],
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
