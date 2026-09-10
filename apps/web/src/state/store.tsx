import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  appReducer,
  freshAppData,
  makeT,
  type AppAction,
  type AppData,
  type EntryType,
  type Lang,
  type Translator,
} from "@sexdiary/core";
import { paletteFor, resolvedTheme, type Palette } from "../theme/palette";

export type { EntryType };

interface Ctx {
  data: AppData;
  dispatch: React.Dispatch<AppAction>;
  t: Translator;
  palette: Palette;
  isDark: boolean;
}

const AppContext = createContext<Ctx | null>(null);

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
}

/**
 * Nothing here is written anywhere.
 *
 * This build is a demonstration of the native app, not a second place to
 * keep a diary — ADR-0001. State lives in memory for as long as the tab
 * does, and a reload starts over from the sample data. That is the whole
 * safeguard: a browser cannot deliver the screenshot block, the
 * hardware-backed lock or the covered app-switcher preview the product
 * is built around, so it must not become somewhere real entries
 * accumulate. Making it forget is cheaper and more honest than warning
 * people not to.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(appReducer, undefined, () =>
    freshAppData(detectLang()),
  );

  const t = useMemo(() => makeT(data.prefs.lang), [data.prefs.lang]);
  const isDark = resolvedTheme(data.prefs.theme) === "dark";
  const palette = useMemo(() => paletteFor(data.prefs.theme), [data.prefs.theme]);

  // re-render on system theme change when theme === "system"
  useEffect(() => {
    if (data.prefs.theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => dispatch({ type: "updatePrefs", patch: {} });
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [data.prefs.theme]);

  return (
    <AppContext.Provider value={{ data, dispatch, t, palette, isDark }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
