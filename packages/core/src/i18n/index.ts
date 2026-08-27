import { en, type Dict } from "./en.js";
import { de } from "./de.js";
import type { Lang } from "../domain.js";

const DICTS: Record<Lang, Dict> = { en, de };

export type TKey = keyof Dict;
export type Translator = <K extends TKey>(
  k: K,
  vars?: Record<string, string | number>,
) => Dict[K] extends string ? string : Dict[K];

/**
 * Plural words for interpolation. English can get away with an "{s}"
 * suffix; German cannot ("1 Tags"), so the noun itself is injected.
 */
export function plurals(
  t: Translator,
  n: number,
): { dayWord: string; encWord: string; doseWord: string } {
  return {
    dayWord: n === 1 ? t("dayOne") : t("dayMany"),
    encWord: n === 1 ? t("encounterOne") : t("encounterMany"),
    doseWord: n === 1 ? t("doseOne") : t("doseMany"),
  };
}

export function makeT(lang: Lang): Translator {
  const dict = DICTS[lang] ?? en;
  return ((k: TKey, vars: Record<string, string | number> = {}) => {
    const raw = (dict[k] ?? en[k]) as unknown;
    if (typeof raw !== "string") return raw;
    let out = raw;
    for (const [a, b] of Object.entries(vars)) {
      out = out.replace(`{${a}}`, String(b));
    }
    return out;
  }) as Translator;
}
