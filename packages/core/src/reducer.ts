/**
 * Pure state reducer shared by every platform shell. Hosts wire it into
 * their own state container (React context on web and mobile today) and
 * handle persistence themselves via the storage envelope.
 */
import type {
  AppData,
  Contact,
  Intercourse,
  Preferences,
  Profile,
  TestRecord,
  Vaccination,
} from "./domain";
import { freshAppData } from "./seed";

export type EntryType = "intercourse" | "test" | "contact" | "vaccination";

export type AppAction =
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

export function appReducer(state: AppData, action: AppAction): AppData {
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
      const blank = freshAppData(state.prefs.lang);
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
