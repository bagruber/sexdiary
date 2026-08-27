import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { usePreventScreenCapture } from "expo-screen-capture";
import { syncReminders } from "./src/lib/reminders";
import type { Lang } from "@sexdiary/core";
import { AppProvider, useApp } from "./src/state/store";
import { APP_NAME } from "./src/branding";
import { tapMedium } from "./src/haptics";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LogScreen } from "./src/screens/LogScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { LockScreen } from "./src/screens/LockScreen";
import { DecoyScreen } from "./src/screens/DecoyScreen";
import { Card, Chip, GhostButton, PrimaryButton, Screen, Title } from "./src/ui";

type Tab = "dashboard" | "log" | "settings";

function Onboarding() {
  const { data, dispatch, t, palette } = useApp();
  const lang = data.prefs.lang;
  const setLang = (l: Lang) =>
    dispatch({ type: "updatePrefs", patch: { lang: l } });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Title>{t("welcomeTitle")}</Title>
        <Text style={{ color: palette.text, marginBottom: 16 }}>
          {t("welcomeBody")}
        </Text>
        <Card>
          <Text style={{ color: palette.sub, fontSize: 13, lineHeight: 19 }}>
            {lang === "de"
              ? "Kein Medizinprodukt. Ersetzt keine ärztliche Beratung. Alle Daten werden ausschließlich verschlüsselt auf diesem Gerät gespeichert."
              : "Not a medical device. Does not replace professional medical advice. All data is stored encrypted on this device only."}
          </Text>
        </Card>

        <Text style={{ color: palette.sub, marginTop: 16, marginBottom: 8 }}>
          {t("onboardLang")}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Chip label="English" active={lang === "en"} onPress={() => setLang("en")} />
          <Chip label="Deutsch" active={lang === "de"} onPress={() => setLang("de")} />
        </View>

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={t("onboardStart")}
            onPress={() => {
              // Real users start with an empty diary, not demo data.
              dispatch({ type: "clearAll" });
              dispatch({ type: "setOnboarded", value: true });
            }}
          />
          <GhostButton
            label={
              lang === "de"
                ? "Mit Beispieldaten erkunden"
                : "Explore with sample data"
            }
            onPress={() => dispatch({ type: "setOnboarded", value: true })}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

/** App name plus, in disguise mode, a one-tap escape to the decoy screen. */
function TopBar({ onHide }: { onHide: () => void }) {
  const { data, t, palette } = useApp();
  const name = data.prefs.disguise ? t("neutralAppName") : APP_NAME;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 6,
      }}
    >
      <Text style={{ color: palette.sub, fontSize: 13, fontWeight: "600" }}>
        {name}
      </Text>
      {data.prefs.disguise && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("hideNow")}
          onPress={() => {
            tapMedium();
            onHide();
          }}
          hitSlop={12}
        >
          <Text style={{ color: palette.sub, fontSize: 13 }}>{t("hideNow")}</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * What the app switcher gets to see. On Android FLAG_SECURE already
 * blanks the preview; on iOS nothing does, so the app covers itself
 * the moment it stops being frontmost.
 */
function Cover() {
  const { data, t, palette } = useApp();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: palette.sub, fontSize: 15, fontWeight: "600" }}>
        {data.prefs.disguise ? t("neutralAppName") : APP_NAME}
      </Text>
    </View>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { t, palette } = useApp();
  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: t("dashboard") },
    { id: "log", label: t("calendar") },
    { id: "settings", label: t("settings") },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: palette.border,
        backgroundColor: palette.card,
      }}
    >
      {tabs.map(({ id, label }) => (
        <Pressable
          key={id}
          onPress={() => setTab(id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === id }}
          style={{ flex: 1, alignItems: "center", paddingVertical: 12 }}
        >
          <Text
            style={{
              color: tab === id ? palette.text : palette.sub,
              fontWeight: tab === id ? "700" : "400",
              fontSize: 13,
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Shell() {
  const { data, t, palette, isDark } = useApp();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [decoy, setDecoy] = useState(false);

  // Android: FLAG_SECURE — no screenshots, no screen recording, and a
  // blank tile in the recents switcher. iOS: blocks screen recording.
  usePreventScreenCapture();

  // Nothing to protect before there is data, and an auth prompt in front
  // of a first-run screen only teaches people to switch the lock off.
  const lockEnabled = data.prefs.lock && data.onboarded;
  const [locked, setLocked] = useState(lockEnabled);
  const [covered, setCovered] = useState(false);

  // The schedule is derived from the data, so it is rebuilt whenever
  // anything it depends on moves. Cheap: a handful of dates.
  const { intercourse, tests, vaccinations } = data;
  useEffect(() => {
    void syncReminders(data, { title: t("reminderTitle"), body: t("reminderBody") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    intercourse,
    tests,
    vaccinations,
    data.prefs.notifs,
    data.prefs.country,
    data.profile.conditions,
  ]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      // "inactive" is the app switcher and system dialogs; "background"
      // is a real handover. Cover for the first, lock for the second —
      // and no grace period, because the attacker in this threat model
      // is standing next to you.
      setCovered(state !== "active");
      if (state === "background" && lockEnabled) setLocked(true);
    });
    return () => sub.remove();
  }, [lockEnabled]);

  if (locked) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <LockScreen onUnlock={() => setLocked(false)} />
      </SafeAreaView>
    );
  }

  if (covered) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Cover />
      </SafeAreaView>
    );
  }

  if (decoy) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <DecoyScreen onExit={() => setDecoy(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {!data.onboarded ? (
        <Onboarding />
      ) : (
        <>
          <TopBar onHide={() => setDecoy(true)} />
          <View style={{ flex: 1 }}>
            {tab === "dashboard" && <DashboardScreen />}
            {tab === "log" && <LogScreen />}
            {tab === "settings" && <SettingsScreen />}
          </View>
          <TabBar tab={tab} setTab={setTab} />
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider
        loading={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
          </View>
        }
      >
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
