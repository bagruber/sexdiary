import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import AtkinsonRegular from "./assets/fonts/AtkinsonHyperlegible-Regular.ttf";
import AtkinsonBold from "./assets/fonts/AtkinsonHyperlegible-Bold.ttf";
import { usePreventScreenCapture } from "expo-screen-capture";
import { syncReminders } from "./src/lib/reminders";
import type { Lang, PartnerAnatomy } from "@sexdiary/core";
import { AppProvider, useApp } from "./src/state/store";
import { APP_NAME } from "./src/branding";
import { tapMedium } from "./src/haptics";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LogScreen } from "./src/screens/LogScreen";
import { AddSheet, type AddKind } from "./src/screens/AddSheets";
import { ConnectScreen } from "./src/screens/ConnectScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { LockScreen } from "./src/screens/LockScreen";
import { DecoyScreen } from "./src/screens/DecoyScreen";
import { Card, Chip, Fab, GhostButton, PrimaryButton, Screen, Text, Title} from "./src/ui";

type Tab = "dashboard" | "log" | "settings";

function Onboarding() {
  const { data, dispatch, t, palette } = useApp();
  const lang = data.prefs.lang;
  const setLang = (l: Lang) =>
    dispatch({ type: "updatePrefs", patch: { lang: l } });

  const [step, setStep] = useState(0);
  const [age, setAge] = useState(data.profile.age);
  const [pa, setPa] = useState<PartnerAnatomy>(data.profile.pa);

  /**
   * Neither answer is decoration. `pa` decides which acts the entry form
   * offers at all (ACT_NEEDS), and skipping leaves the widest set rather
   * than a wrong one — so skipping is offered, and costs nothing.
   *
   * `clearAll` keeps the profile, so the order here is safe.
   */
  const finish = (sample: boolean) => {
    dispatch({ type: "updateProfile", patch: { age, pa } });
    if (!sample) dispatch({ type: "clearAll" });
    dispatch({ type: "setOnboarded", value: true });
  };

  const anatomy: { id: PartnerAnatomy; label: string }[] = [
    { id: "both", label: t("both") },
    { id: "penis", label: t("penis") },
    { id: "vagina", label: t("vagina") },
  ];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <>
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
          </>
        )}

        {step === 1 && (
          <>
            <Title>{t("onboardAge")}</Title>
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="28"
              placeholderTextColor={palette.sub}
              accessibilityLabel={t("onboardAge")}
              style={{
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 17,
                marginTop: 12,
              }}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Title>{t("onboardAnatomy")}</Title>
            <View style={{ marginTop: 12 }}>
              {anatomy.map((a) => (
                <Chip
                  key={a.id}
                  label={a.label}
                  active={pa === a.id}
                  onPress={() => setPa(a.id)}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ marginTop: 24 }}>
          {step < 2 ? (
            <>
              <PrimaryButton
                label={t("onboardContinue")}
                onPress={() => setStep((n) => n + 1)}
              />
              {step === 1 && (
                <GhostButton label={t("onboardSkip")} onPress={() => setStep(2)} />
              )}
            </>
          ) : (
            <>
              <PrimaryButton label={t("onboardStart")} onPress={() => finish(false)} />
              <GhostButton
                label={
                  lang === "de"
                    ? "Mit Beispieldaten erkunden"
                    : "Explore with sample data"
                }
                onPress={() => finish(true)}
              />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

/**
 * App-Name, der Tokentausch, und im Tarnmodus der Griff auf den
 * harmlosen Bildschirm.
 *
 * Der QR-Knopf steht hier fest, weil der Tausch im Moment passiert und
 * nicht danach: erst ein Eingabeblatt oeffnen zu muessen waere ein
 * Umweg an genau der Stelle, an der jemand daneben wartet.
 */
function TopBar({ onHide, onQr }: { onHide: () => void; onQr: () => void }) {
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("shareTitle")}
          onPress={() => {
            tapMedium();
            onQr();
          }}
          hitSlop={12}
        >
          <Text style={{ color: palette.sub, fontSize: 13 }}>{t("qrShort")}</Text>
        </Pressable>
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
  const [adding, setAdding] = useState<AddKind | null>(null);
  const [fan, setFan] = useState(false);
  const [connect, setConnect] = useState(false);

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
          <TopBar onHide={() => setDecoy(true)} onQr={() => setConnect(true)} />
          <View style={{ flex: 1 }}>
            {tab === "dashboard" && <DashboardScreen />}
            {tab === "log" && <LogScreen />}
            {tab === "settings" && <SettingsScreen />}
            {tab !== "settings" && (
              <>
                {/*
                  Ein Tipp gibt die Begegnung — der haeufigste Fall bleibt
                  der schnellste. Langes Druecken oeffnet die uebrigen drei.
                  Wer den Langdruck nicht kennt, kommt ueber die Leiste im
                  Blatt selbst genauso hin; das ist Absicht.
                */}
                <Fab
                  label={t("intercourse")}
                  onPress={() => setAdding("intercourse")}
                  onLongPress={() => setFan(true)}
                />
                {fan && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("cancel")}
                    onPress={() => setFan(false)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      paddingRight: 18,
                      paddingBottom: 88,
                      backgroundColor: "rgba(0,0,0,0.15)",
                    }}
                  >
                    {(
                      [
                        ["test", t("testEntry")],
                        ["contact", t("contact")],
                        ["vaccination", t("vaccination")],
                      ] as [AddKind, string][]
                    ).map(([id, label]) => (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        onPress={() => {
                          setFan(false);
                          setAdding(id);
                        }}
                        style={{
                          backgroundColor: palette.card,
                          borderColor: palette.border,
                          borderWidth: 1,
                          borderRadius: 10,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: palette.text }}>{label}</Text>
                      </Pressable>
                    ))}
                  </Pressable>
                )}
              </>
            )}
          </View>
          <TabBar tab={tab} setTab={setTab} />
          <Modal
            visible={adding !== null}
            animationType="slide"
            onRequestClose={() => setAdding(null)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: palette.bg,
                padding: 16,
                paddingTop: 48,
              }}
            >
              {adding && (
                <AddSheet
                  kind={adding}
                  onKind={setAdding}
                  onClose={() => setAdding(null)}
                  onQr={() => {
                    setAdding(null);
                    setConnect(true);
                  }}
                />
              )}
            </View>
          </Modal>
          <Modal
            visible={connect}
            animationType="slide"
            onRequestClose={() => setConnect(false)}
          >
            <View style={{ flex: 1, backgroundColor: palette.bg }}>
              <ConnectScreen onClose={() => setConnect(false)} />
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  // Mitgeliefert, nie nachgeladen: die Dateien liegen im Paket, es geht
  // keine Anfrage an einen fremden Server (siehe apps/mobile/assets/fonts).
  const [fontsReady] = useFonts({
    Atkinson: AtkinsonRegular,
    "Atkinson-Bold": AtkinsonBold,
  });

  if (!fontsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

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
