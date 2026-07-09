import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { getLocales } from "expo-localization";
import {
  appReducer,
  makeT,
  type AppAction,
  type AppData,
  type Lang,
  type Translator,
} from "@sexdiary/core";
import { loadAppData, saveAppData } from "../lib/secure-storage";
import { dark, light, type MobilePalette } from "../theme";

export function detectLang(): Lang {
  return getLocales()[0]?.languageCode === "de" ? "de" : "en";
}

interface Ctx {
  data: AppData;
  dispatch: (action: AppAction) => void;
  t: Translator;
  palette: MobilePalette;
  isDark: boolean;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({
  children,
  loading,
}: {
  children: ReactNode;
  loading: ReactNode;
}) {
  const [data, setData] = useState<AppData | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    loadAppData(detectLang()).then((d) => {
      loaded.current = true;
      setData(d);
    });
  }, []);

  useEffect(() => {
    if (data && loaded.current) {
      saveAppData(data).catch((e) => console.warn("Save failed", e));
    }
  }, [data]);

  const dispatch = useCallback((action: AppAction) => {
    setData((d) => (d ? appReducer(d, action) : d));
  }, []);

  const systemScheme = useColorScheme();
  const t = useMemo(
    () => makeT(data?.prefs.lang ?? detectLang()),
    [data?.prefs.lang],
  );
  const theme = data?.prefs.theme ?? "system";
  const isDark =
    theme === "dark" || (theme === "system" && systemScheme === "dark");
  const palette = isDark ? dark : light;

  if (!data) return <>{loading}</>;

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
