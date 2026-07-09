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
  makeT,
  type AppAction,
  type AppData,
  type EntryType,
  type Translator,
} from "@sexdiary/core";
import { loadAppData, saveAppData, clearAppData } from "../lib/storage";
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(appReducer, undefined, loadAppData);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

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

export { clearAppData };
