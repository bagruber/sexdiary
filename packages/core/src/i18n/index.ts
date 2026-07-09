import { en, type Dict } from "./en";
import { de } from "./de";
import type { Lang } from "../domain";

const DICTS: Record<Lang, Dict> = { en, de };

export type TKey = keyof Dict;
export type Translator = <K extends TKey>(
  k: K,
  vars?: Record<string, string | number>,
) => Dict[K] extends string ? string : Dict[K];

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
