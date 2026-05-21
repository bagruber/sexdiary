import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./state/store";
import { DashboardView } from "./views/DashboardView";
import { CalendarView } from "./views/CalendarView";
import { ConnectView } from "./views/ConnectView";
import { SettingsView } from "./views/SettingsView";
import { AlertsView } from "./views/AlertsView";
import { OnboardingView } from "./views/OnboardingView";
import { TestsListView, ContactsListView } from "./views/ListViews";
import { BottomNav, type ViewId } from "./components/chrome/BottomNav";
import { FAB } from "./components/chrome/FAB";
import {
  AddEditSheet,
  type EditType,
} from "./components/sheets/AddEditSheet";
import { PositiveResultModal } from "./components/modals/PositiveResultModal";
import type {
  AppData,
  Contact,
  Intercourse,
  TestRecord,
  Vaccination,
} from "./types/domain";
import { parseImportPayload } from "./data/schema";

type Overlay =
  | { kind: "alerts" }
  | { kind: "testsList" }
  | { kind: "contactsList" }
  | null;

interface AddState {
  tab?: EditType;
  type?: EditType;
  data?: unknown;
}

function AppShell() {
  const { data, dispatch, palette, t } = useApp();
  const [view, setView] = useState<ViewId>("dashboard");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [addState, setAddState] = useState<AddState | null>(null);
  const [posStis, setPosStis] = useState<string[] | null>(null);

  useEffect(() => {
    document.body.style.background = palette.bg;
    document.body.style.color = palette.text;
  }, [palette.bg, palette.text]);

  useEffect(() => {
    document.body.classList.toggle("reduce-motion", data.prefs.reducedMotion);
  }, [data.prefs.reducedMotion]);

  const lang = data.prefs.lang;

  const xport = () => {
    const payload: Pick<
      AppData,
      "contacts" | "intercourse" | "tests" | "vaccinations" | "profile"
    > = {
      contacts: data.contacts,
      intercourse: data.intercourse,
      tests: data.tests,
      vaccinations: data.vaccinations,
      profile: data.profile,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sexual-health-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text) as {
          contacts?: Contact[];
          intercourse?: Intercourse[];
          tests?: TestRecord[];
          vaccinations?: Vaccination[];
          profile?: AppData["profile"];
        };
        // Try as full backup first
        if (parsed.contacts || parsed.intercourse || parsed.tests) {
          dispatch({
            type: "replaceAll",
            payload: {
              ...data,
              contacts: parsed.contacts ?? data.contacts,
              intercourse: parsed.intercourse ?? data.intercourse,
              tests: parsed.tests ?? data.tests,
              vaccinations: parsed.vaccinations ?? data.vaccinations,
              profile: parsed.profile ?? data.profile,
            },
          });
          return;
        }
        // Otherwise try schema-format single record
        const r = parseImportPayload(text);
        if (r.kind === "test")
          dispatch({ type: "saveTest", payload: r.record });
        else if (r.kind === "contact")
          dispatch({ type: "saveContact", payload: r.record });
        else alert(t("importInvalid"));
      } catch {
        alert(t("importInvalid"));
      }
    };
    input.click();
  };

  const delAll = () => {
    if (window.confirm(lang === "de" ? "Alle Daten löschen?" : "Delete all data?")) {
      dispatch({ type: "clearAll" });
    }
  };

  if (!data.onboarded) {
    return <OnboardingView onDone={() => setView("dashboard")} />;
  }

  const onAddSaved = (type: EditType, saved: unknown) => {
    setAddState(null);
    if (type === "test") {
      const test = saved as TestRecord;
      const pos = Object.entries(test.results ?? {})
        .filter(([, v]) => v === "positive")
        .map(([k]) => k);
      if (pos.length) setPosStis(pos);
    }
  };

  const startEdit = (entry: "intercourse" | "test" | "vaccination", record: unknown) => {
    setAddState({ type: entry, data: record });
  };

  const findRecord = (
    list: "tests" | "contacts",
    id: string,
  ): TestRecord | Contact | undefined => {
    const arr = list === "tests" ? data.tests : data.contacts;
    return (arr as Array<TestRecord | Contact>).find((r) => r.id === id);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        background: palette.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {overlay?.kind === "alerts" && <AlertsView onBack={() => setOverlay(null)} />}
      {overlay?.kind === "testsList" && (
        <TestsListView
          onBack={() => setOverlay(null)}
          onEdit={(id) => {
            const r = findRecord("tests", id);
            if (r) {
              setOverlay(null);
              setAddState({ type: "test", data: r });
            }
          }}
        />
      )}
      {overlay?.kind === "contactsList" && (
        <ContactsListView
          onBack={() => setOverlay(null)}
          onEdit={(id) => {
            const r = findRecord("contacts", id);
            if (r) {
              setOverlay(null);
              setAddState({ type: "contact", data: r });
            }
          }}
        />
      )}

      {!overlay && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {view === "dashboard" && (
            <DashboardView onAlerts={() => setOverlay({ kind: "alerts" })} />
          )}
          {view === "calendar" && <CalendarView onEdit={startEdit} />}
          {view === "share" && <ConnectView />}
          {view === "settings" && (
            <SettingsView
              onExport={xport}
              onImport={importFile}
              onDelAll={delAll}
              onTestsList={() => setOverlay({ kind: "testsList" })}
              onContactsList={() => setOverlay({ kind: "contactsList" })}
            />
          )}
        </div>
      )}

      <BottomNav
        view={view}
        setView={(v) => {
          setOverlay(null);
          setView(v);
        }}
      />
      {(view === "dashboard" || view === "calendar") && !overlay && (
        <FAB onAdd={(kind) => setAddState({ tab: kind })} />
      )}

      {addState && (
        <AddEditSheet
          onClose={() => setAddState(null)}
          editType={(addState.type as EditType) ?? null}
          editData={addState.data}
          initTab={addState.tab ?? null}
          onAfterSave={onAddSaved}
        />
      )}

      {posStis && (
        <PositiveResultModal
          stis={posStis}
          onGo={() => {
            setPosStis(null);
            setView("dashboard");
            setOverlay({ kind: "alerts" });
          }}
          onDismiss={() => setPosStis(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
