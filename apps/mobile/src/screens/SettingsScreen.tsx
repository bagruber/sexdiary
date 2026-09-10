import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Switch, Text, TextInput, View } from "react-native";
import {
  CONTACT_PLATFORMS,
  COUNTRIES,
  STI_NAMES,
  formatDate,
  type ContactHandlePlatform,
  type Lang,
  type PartnerAnatomy,
  type Theme,
} from "@sexdiary/core";
import { useApp } from "../state/store";
import { APP_NAME } from "../branding";
import { Card, Chip, PrimaryButton, Row, Screen, SectionTitle, Title } from "../ui";
import { DataScreen } from "./DataScreen";
import { BackupSheet } from "./BackupSheet";
import { authenticate, lockAvailability, type LockAvailability } from "../lib/app-lock";
import {
  cancelReminders,
  pendingReminders,
  requestReminderPermission,
  sendTestReminder,
} from "../lib/reminders";

const THEMES: Theme[] = ["system", "light", "dark"];
const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

export function SettingsScreen() {
  const { data, dispatch, t, palette } = useApp();
  const [showData, setShowData] = useState(false);
  const [backup, setBackup] = useState<"export" | "import" | null>(null);
  const [condOpen, setCondOpen] = useState(false);

  const { profile } = data;
  const updProfile = (patch: Partial<typeof profile>) =>
    dispatch({ type: "updateProfile", patch });
  const updPrefs = (patch: Partial<typeof data.prefs>) =>
    dispatch({ type: "updatePrefs", patch });

  const feld = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: palette.text,
    marginTop: 8,
  };
  const [canLock, setCanLock] = useState<LockAvailability | null>(null);
  const [pending, setPending] = useState<Date[] | null>(null);
  const [testSent, setTestSent] = useState(false);
  const lang = data.prefs.lang;

  const [notifsDenied, setNotifsDenied] = useState(false);

  useEffect(() => {
    void lockAvailability().then(setCanLock);
  }, []);

  /**
   * Asking first, promising second. A switch that stays on while the OS
   * refuses to deliver would be the same lie the lock used to be.
   */
  const toggleNotifs = async (on: boolean) => {
    if (!on) {
      dispatch({ type: "updatePrefs", patch: { notifs: false } });
      await cancelReminders();
      return;
    }
    const granted = await requestReminderPermission();
    setNotifsDenied(!granted);
    if (granted) dispatch({ type: "updatePrefs", patch: { notifs: true } });
  };

  const themeLabel: Record<Theme, string> = {
    system: t("themeSystem"),
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  /**
   * Switching the lock *off* is authenticated too. Otherwise the lock
   * defends only against someone who never opens the settings — and the
   * threat model is someone holding your unlocked phone.
   */
  const toggleLock = async (on: boolean) => {
    if (on) {
      dispatch({ type: "updatePrefs", patch: { lock: true } });
      return;
    }
    if (await authenticate(t("lockPrompt"))) {
      dispatch({ type: "updatePrefs", patch: { lock: false } });
    }
  };

  const confirmDeleteAll = () => {
    Alert.alert(
      t("deleteAllData"),
      t("deleteAllDataSub"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => dispatch({ type: "clearAll" }),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{t("settings")}</Title>

        <SectionTitle>{t("profile")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text }}>{t("age")}</Text>
          <TextInput
            value={profile.age}
            onChangeText={(v) => updProfile({ age: v })}
            keyboardType="number-pad"
            accessibilityLabel={t("age")}
            style={feld}
          />
        </Card>
        <Card>
          <Text style={{ color: palette.text, marginBottom: 8 }}>
            {t("partnerAnatomy")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(["both", "penis", "vagina"] as PartnerAnatomy[]).map((a) => (
              <Chip
                key={a}
                label={t(a === "both" ? "both" : a)}
                active={profile.pa === a}
                onPress={() => updProfile({ pa: a })}
              />
            ))}
          </View>
        </Card>
        <Row
          label={t("knownConditions")}
          sub={
            profile.conditions.length
              ? profile.conditions.join(", ")
              : t("knownConditionsSub")
          }
          onPress={() => setCondOpen(true)}
        />

        <SectionTitle>{t("general")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text, marginBottom: 8 }}>{t("language")}</Text>
          <View style={{ flexDirection: "row" }}>
            {LANGS.map((l) => (
              <Chip
                key={l.value}
                label={l.label}
                active={lang === l.value}
                onPress={() =>
                  dispatch({ type: "updatePrefs", patch: { lang: l.value } })
                }
              />
            ))}
          </View>
        </Card>
        <Card>
          <Text style={{ color: palette.text, marginBottom: 8 }}>{t("theme")}</Text>
          <View style={{ flexDirection: "row" }}>
            {THEMES.map((th) => (
              <Chip
                key={th}
                label={themeLabel[th]}
                active={data.prefs.theme === th}
                onPress={() =>
                  dispatch({ type: "updatePrefs", patch: { theme: th } })
                }
              />
            ))}
          </View>
        </Card>

        <SectionTitle>{t("privacy")}</SectionTitle>
        <Row
          label={t("testReminders")}
          sub={t("testRemindersSub")}
          right={
            <Switch
              value={data.prefs.notifs}
              onValueChange={(v) => void toggleNotifs(v)}
              accessibilityLabel={t("testReminders")}
            />
          }
        />
        {notifsDenied ? (
          <Card>
            <Text style={{ color: palette.warn, fontSize: 12, lineHeight: 17 }}>
              {t("remindersUnavailable")}
            </Text>
          </Card>
        ) : (
          data.prefs.notifs && (
            <>
              <Card>
                <Text style={{ color: palette.sub, fontSize: 12, lineHeight: 17 }}>
                  {t("remindersNote")}
                </Text>
              </Card>
              <Row
                label={t("remindersCheck")}
                sub={
                  pending === null
                    ? t("remindersCheckSub")
                    : pending.length === 0
                      ? t("remindersNonePending")
                      : `${t("remindersPending", { n: pending.length })} · ${formatDate(
                          pending[0].toISOString().slice(0, 10),
                          data.prefs.lang,
                        )}`
                }
                onPress={() => {
                  void (async () => {
                    setPending(await pendingReminders());
                    setTestSent(await sendTestReminder({
                      title: t("reminderTitle"),
                      body: t("reminderBody"),
                    }));
                  })();
                }}
              />
              {testSent && (
                <Card>
                  <Text style={{ color: palette.good, fontSize: 12, lineHeight: 17 }}>
                    {t("remindersTestSent")}
                  </Text>
                </Card>
              )}
            </>
          )
        )}
        <Row
          label={t("appLock")}
          sub={t("appLockSub")}
          right={
            <Switch
              value={data.prefs.lock}
              disabled={canLock === "none"}
              onValueChange={(v) => void toggleLock(v)}
              accessibilityLabel={t("appLock")}
            />
          }
        />
        {canLock === "none" ? (
          <Card>
            <Text style={{ color: palette.warn, fontSize: 12, lineHeight: 17 }}>
              {t("appLockUnavailable")}
            </Text>
          </Card>
        ) : (
          data.prefs.lock && (
            <Card>
              <Text style={{ color: palette.sub, fontSize: 12, lineHeight: 17 }}>
                {t("appLockNote")}
              </Text>
            </Card>
          )
        )}
        <Row
          label={t("disguiseMode")}
          sub={t("disguiseModeSub")}
          right={
            <Switch
              value={data.prefs.disguise}
              onValueChange={(v) =>
                dispatch({ type: "updatePrefs", patch: { disguise: v } })
              }
              accessibilityLabel={t("disguiseMode")}
            />
          }
        />
        {data.prefs.disguise && (
          <Card>
            <Text style={{ color: palette.sub, fontSize: 12, lineHeight: 17 }}>
              {t("disguiseNote")}
            </Text>
          </Card>
        )}

        <Card>
          <Text style={{ color: palette.text, marginBottom: 4 }}>{t("region")}</Text>
          <Text style={{ color: palette.sub, fontSize: 12, marginBottom: 8 }}>
            {t("regionSub")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {COUNTRIES.map((c) => (
              <Chip
                key={c}
                label={c}
                active={data.prefs.country === c}
                onPress={() => updPrefs({ country: c })}
              />
            ))}
          </ScrollView>
        </Card>
        {(
          [
            ["highPrev", "highPrevToggle", "highPrevToggleSub"],
            ["reducedMotion", "reducedMotion", "reducedMotionSub"],
            ["hideLowRisk", "hideLowRisk", "hideLowRiskSub"],
          ] as const
        ).map(([key, label, sub]) => (
          <Row
            key={key}
            label={t(label)}
            sub={t(sub)}
            right={
              <Switch
                value={data.prefs[key]}
                onValueChange={(v) => updPrefs({ [key]: v })}
                accessibilityLabel={t(label)}
              />
            }
          />
        ))}

        <SectionTitle>{t("sharingPrefs")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text, marginBottom: 8 }}>{t("shareMode")}</Text>
          <View style={{ flexDirection: "row" }}>
            <Chip
              label={t("shareTokenOnlyLabel")}
              active={data.prefs.shareMode === "token"}
              onPress={() => updPrefs({ shareMode: "token" })}
            />
            <Chip
              label={t("shareWithHandle")}
              active={data.prefs.shareMode === "handle"}
              onPress={() => updPrefs({ shareMode: "handle" })}
            />
          </View>
        </Card>
        {data.prefs.shareMode === "handle" && (
          <Card>
            <Text style={{ color: palette.text, marginBottom: 8 }}>
              {t("sharePlatform")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CONTACT_PLATFORMS.map((pf) => (
                <Chip
                  key={pf}
                  label={pf}
                  active={data.prefs.sharePlatform === pf}
                  onPress={() =>
                    updPrefs({ sharePlatform: pf as ContactHandlePlatform })
                  }
                />
              ))}
            </ScrollView>
            <Text style={{ color: palette.text, marginTop: 12 }}>
              {t("shareHandle")}
            </Text>
            <TextInput
              value={data.prefs.shareHandle}
              onChangeText={(v) => updPrefs({ shareHandle: v })}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={t("shareHandle")}
              style={feld}
            />
          </Card>
        )}

        <SectionTitle>{t("backupSection")}</SectionTitle>
        <Row
          label={t("backupExport")}
          sub={t("backupExportSub")}
          onPress={() => setBackup("export")}
        />
        <Row
          label={t("backupImport")}
          sub={t("backupImportSub")}
          onPress={() => setBackup("import")}
        />

        <SectionTitle>{t("data")}</SectionTitle>
        <Row
          label={t("yourData")}
          sub={t("yourDataSub")}
          onPress={() => setShowData(true)}
        />
        <PrimaryButton label={t("deleteAllData")} onPress={confirmDeleteAll} danger />

        <SectionTitle>{t("about")}</SectionTitle>
        <Card>
          <Text style={{ color: palette.text, fontWeight: "600" }}>
            {t("medicalDisclaimer")}
          </Text>
          <Text style={{ color: palette.sub, marginTop: 4, fontSize: 13 }}>
            {lang === "de"
              ? "Diese App ist kein Medizinprodukt und ersetzt keine ärztliche Beratung. Risikoangaben sind Schätzungen zu Informationszwecken."
              : "This app is not a medical device and does not replace professional medical advice. Risk figures are informational estimates."}
          </Text>
        </Card>
        <Card>
          <Text style={{ color: palette.sub, fontSize: 13 }}>
            {APP_NAME} · {t("version")} 0.2.0
          </Text>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>

      {showData && <DataScreen onClose={() => setShowData(false)} />}
      <Modal
        visible={condOpen}
        animationType="slide"
        onRequestClose={() => setCondOpen(false)}
      >
        <View
          style={{ flex: 1, backgroundColor: palette.bg, padding: 16, paddingTop: 48 }}
        >
          <Title>{t("knownConditions")}</Title>
          <Text style={{ color: palette.sub, marginBottom: 12, lineHeight: 19 }}>
            {t("knownConditionsHint")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {STI_NAMES.map((sti) => (
              <Chip
                key={sti}
                label={sti}
                active={profile.conditions.includes(sti)}
                onPress={() => {
                  const set = new Set(profile.conditions);
                  if (set.has(sti)) set.delete(sti);
                  else set.add(sti);
                  updProfile({ conditions: [...set] });
                }}
              />
            ))}
          </View>
          <PrimaryButton label={t("save")} onPress={() => setCondOpen(false)} />
        </View>
      </Modal>
      <Modal
        visible={backup !== null}
        animationType="slide"
        onRequestClose={() => setBackup(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: palette.bg,
            padding: 16,
            paddingTop: 48,
          }}
        >
          {backup && (
            <BackupSheet mode={backup} onClose={() => setBackup(null)} />
          )}
        </View>
      </Modal>

    </Screen>
  );
}
