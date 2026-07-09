import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppData,
  Contact,
  Intercourse,
  Preferences,
  Profile,
  TestRecord,
  Vaccination,
} from "@sexdiary/core";
import { loadAppData, saveAppData, clearAppData } from "../lib/storage";
import { freshAppData } from "@sexdiary/core";
import { paletteFor, resolvedTheme, type Palette } from "../theme/palette";
import { makeT, type Translator } from "@sexdiary/core";

export type EntryType = "intercourse" | "test" | "contact" | "vaccination";

type Action =
  | { type: "saveIntercourse"; payload: Intercourse }
  | { type: "saveTest"; payload: TestRecord }
  | { type: "saveContact"; payload: Contact }
  | { type: "saveVaccination"; payload: Vaccination }
  | { type: "deleteEntry"; entry: EntryType; id: string }
  | { type: "updateProfile"; patch: Partial<Profile> }
  | { type: "updatePrefs"; patch: Partial<Preferences> }
  | { type: "setOnboarded"; value: boolean }
  | { type: "replaceAll"; payload: AppData }
  | { type: "clearAll" };

function reducer(state: AppData, action: Action): AppData {
  const upsert = <T extends { id: string }>(list: T[], item: T): T[] => {
    const i = list.findIndex((e) => e.id === item.id);
    if (i >= 0) {
      const next = list.slice();
      next[i] = item;
      return next;
    }
    return [...list, item];
  };

  switch (action.type) {
    case "saveIntercourse":
      return { ...state, intercourse: upsert(state.intercourse, action.payload) };
    case "saveTest":
      return { ...state, tests: upsert(state.tests, action.payload) };
    case "saveContact":
      return { ...state, contacts: upsert(state.contacts, action.payload) };
    case "saveVaccination":
      return {
        ...state,
        vaccinations: upsert(state.vaccinations, action.payload),
      };
    case "deleteEntry": {
      const drop = <T extends { id: string }>(list: T[]) =>
        list.filter((e) => e.id !== action.id);
      if (action.entry === "intercourse")
        return { ...state, intercourse: drop(state.intercourse) };
      if (action.entry === "test") return { ...state, tests: drop(state.tests) };
      if (action.entry === "contact")
        return { ...state, contacts: drop(state.contacts) };
      return { ...state, vaccinations: drop(state.vaccinations) };
    }
    case "updateProfile":
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case "updatePrefs":
      return { ...state, prefs: { ...state.prefs, ...action.patch } };
    case "setOnboarded":
      return { ...state, onboarded: action.value };
    case "replaceAll":
      return action.payload;
    case "clearAll": {
      const blank = freshAppData();
      return {
        ...blank,
        contacts: [],
        intercourse: [],
        tests: [],
        vaccinations: [],
        prefs: state.prefs,
        profile: state.profile,
        myToken: state.myToken,
        onboarded: true,
      };
    }
  }
}

interface Ctx {
  data: AppData;
  dispatch: React.Dispatch<Action>;
  t: Translator;
  palette: Palette;
  isDark: boolean;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadAppData);

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
